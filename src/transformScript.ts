import { trim } from 'lazy-js-utils'
const DEFINECOMPONENT = /^export default defineComponent\((.*})\)$/gms
const NAME = /name:\s*(['"\w]+)/
const PROPS = /props:\s*{[\s\n]*([\w:<>\s\[\],]+)}/gsm
const PROPSHASAS = /(\w+):\s*\w+\s*as\s*PropType<([\w\[\]]+)>/gsm
const EMIT = /emit:\s*(\[.*\])/gsm
const SETUP = /setup\([\w,\s{}:]+\)\s*{(.*)}\n/gsm
const RETURN = /return\s*{.*}$/gsm
const MOUNTED = /mounted\(\){(.*)}\n/gsm
const THISFN = /this.([\w\_\-$]+\(\))/gsm
const EXPORTDEFAULT = /export default\s*{(.*)}/gsm
const DATA = /data\s*\(\s*\)\s*{[\n\s]*return\s*{[\n\s]*([\n\s\w\_:'",]+)}[\s\n]*},/gm
const DATAITEM = /(.*):\s*(.*)[,\n\s]/gm
const METHODS = /methods:\s*{([\w\s\n"'\-\_$+\-{}\(\).,]*)},/gms
const THISDEEP = /this.([$\_\w]+)[.]*/gms
const COMPUTED = /computed:\s*{([\s\n\w\(\){}"'$-_]*)},/gm
const COMPUTEDITEM = /(\w+)\(\)(\s*{[\s\n\w\-\+"'$\_.]*})/gm
export function transform(scriptStr: string): string {
  let result = ''
  if (DEFINECOMPONENT.test(scriptStr)) {
    scriptStr.replace(DEFINECOMPONENT, (_, r) => {
      const name = getName(r) // defineOptions
      const props = getProps(r)
      const emit = getEmit(r)
      const setup = getSetup(r)
      const mounted = getMounted(r)

      result = [name, props, emit, setup, mounted].join('\n')
      return result
    })
  } else if (EXPORTDEFAULT.test(scriptStr)) {
    scriptStr.replace(EXPORTDEFAULT, (_, r) => {
      const name = getName(r) // defineOptions
      const props = getProps(r)
      const emit = getEmit(r)
      const data = getData(r)
      const mounted = getMounted(r)
      const methods = getMethods(r)
      const computed = getComputed(r)

      result = [name, props, emit, data, computed, methods, mounted].join('\n')
      return r
    })
  }

  return result
}

function getName(r: string) {
  let name
  r.replace(NAME, (_: string, v: string) => (name = v))
  if (name) {
    // defineOptions
    return `defineOptions({
  name: ${name}
})`
  }
}

function getProps(r: string) {
  let definePropsType = ''
  r.replace(PROPS, (_: string, v: string) => {
    v = v.replace(PROPSHASAS, (_, v1, v2) => `${v1}: ${v2}`)
    definePropsType = trim(v, 'all').replace(',', ';')
    return v
  })
  if (definePropsType) {
    return `const props = defineProps<{${definePropsType}}>()`
  }
}

function getEmit(r: string) {
  let emit
  r.replace(EMIT, (_: string, v: string) => (emit = v))
  if (emit) {
    return `const emit = defineEmits(${emit})`
  }
}

function getSetup(r: string) {
  let setup
  r.replace(SETUP, (_: string, v: string) => {
    v = v.replace('expose(', 'defineExpose(')
      .replace(RETURN, '')
    setup = tidy(v)
    return v
  })
  return setup
}

function getMounted(r: string) {
  let result
  r.replace(MOUNTED, ((_: string, v: string) => {
    result = getThisTransform(v)
    return v
  }))
  if (result) {
    return `onMounted(()=>{\n${result}\n})`
  }
}

function tidy(v: string) {
  const space = '$__x__'
  return trim(v)
    .replace(/\n/g, space)
    .replace(/\s{2,}/g, '\n')
    .replaceAll(space, '')
}

function getData(r: string) {
  let result: string = ''
  r.replace(DATA, (_, v) => {
    return v.replace(DATAITEM, (_: string, key: string, val: string) => {

      if (val.endsWith(','))
        val = val.substring(0, val.length - 1)
      result += `const ${key.trim()} = ref(${val})\n`
      return v
    })
  })
  return result
}

function getMethods(r: string) {
  let result
  r.replace(METHODS, (_, v) => {
    const space = '$__temp'
    v = v.replace(/,\n\s*/g, space)
    result = getThisTransform(v).split(space).map(item => `function ${item}`).join('\n')
    return result
  })
  return result
}

function getThisTransform(r: string) {
  return tidy(r
    .replace(THISFN, (_, c) => c)
    .replace(THISDEEP, (_, v) => `${v}.value`))
}

function getComputed(r: string) {
  let result = ''
  r.replace(COMPUTED, (_, v) =>
    getThisTransform(v).replace(COMPUTEDITEM, (_, key, val) =>
      result += `const ${key} = computed(() => ${val})\n`))
  return result
}
