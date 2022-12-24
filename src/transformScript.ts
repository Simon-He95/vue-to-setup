import { trim } from 'lazy-js-utils'
const DEFINECOMPONENT = /^export default defineComponent\((.*})\)$/gms
const NAME = /name:\s*(['"\w]+)/
const PROPS = /props:\s*{[\s\n]*([\w:<>\s\[\],]+)}/gsm
const PROPSHASAS = /(\w+):\s*\w+\s*as\s*PropType<([\w\[\]]+)>/gsm
const EMIT = /emit:\s*(\[.*\])/gsm
const SETUP = /setup\([\w,\s{}:]+\)\s*{(.*)}\n/gsm
const RETURN = /return\s*{.*}$/gsm
const MOUNTED = /mounted\(\){(.*)}\n/gsm
const THIS = /this.([\w\_\-$]+)/gsm
const THISFN = /this.([\w\_\-$]+\(\))/gsm
export function transform(scriptStr: string): string {
  let result = ''
  scriptStr.replace(DEFINECOMPONENT, (_, r) => {
    const name = getName(r) // defineOptions
    const props = getProps(r)
    const emit = getEmit(r)
    const setup = getSetup(r)
    const mounted = getMounted(r)

    result = [name, props, emit, setup, mounted].join('\n')
    return result
  })
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
    result = tidy(v.replace(THISFN, (_, c) => c)
      .replace(THIS, (_, c) => c + '.value'))
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
