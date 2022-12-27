import { trim } from 'lazy-js-utils'
const DEFINECOMPONENT = /^export default defineComponent\((.*})\)$/gms
const NAME = /{\n\s*name:\s*(['"]\w+['"])/
const PROPS = /props:\s*{[\s\n]*([\w:<>\s\[\],]+)}/gsm
const PROPSARRAY = /props:\s*\[([\s'"\w\-\_$,]+)*\]/g
const PROPSHASAS = /(\w+):\s*\w+\s*as\s*PropType<([\w\[\]]+)>/gsm
const EMIT = /emit:\s*(\[.*\])/gsm
const SETUP = /setup\([\w,\s{}:]+\)\s*{(.*)}\n/gsm
const RETURN = /return\s*{.*}$/gsm
const MOUNTED = /mounted\(\){(.*)}\n/gsm
const THISFN = /this.([\w\_\-$]+\(\))/gsm
const EXPORTDEFAULT = /export default\s*{(.*)}/gsm
const DATA = /data\s*\(\s*\)\s*{[\n\s]*return\s*{[\n\s]*([\n\s\w\_:'",]+)}[\s\n]*},/g
const DATAFUNCTION = /data:\s*function\s*\(\)\s*{[\n\s]*return\s*{[\n\s]*([\n\s\w\_:'",]+)}[\s\n]*}/g
const DATAITEM = /(.*):\s*(.*)[,\n\s]/gm
const METHODS = /methods:\s*{([\w\s\n"'\-\_$+\-{}\(\).,]*)},/gms
const THISDEEP = /this.([$\_\w]+)[.]*/gms
const COMPUTED = /computed:\s*{([\s\n\w\(\){}"'$-_]*)},/gm
const COMPUTEDITEM = /(\w+)\(\)(\s*{[\s\n\w\-\+"'$\_.]*})/gm
const IMPORTFROMVUE = /import\s+{([\w$,\s]+)}\s+from\s+['"]vue['"]/gm
const WATCH = /watch:\s*{([\s\n\w\-\_$.'"\(\){},;]*})[\n\s]*},/
const WATCHITEM = /(\w+)(\([\w,]*\))\s*({[\s\n\w.;'"$-_+-]*})/g
const MODELEVENT = /model:\s*{[\n\s\w'"-_$]+event:\s*(['"][\w\-\_$]+['"])/
export function transform(scriptStr: string): string {
  let result = ''
  const import_from_vue: string[] = []

  scriptStr = scriptStr.replace(IMPORTFROMVUE, (_, v) => {
    import_from_vue.push(...trim(v, 'all').split(','))
    return ''
  })
  if (DEFINECOMPONENT.test(scriptStr)) {
    scriptStr.replace(DEFINECOMPONENT, (_, r) => {
      const [props, r1] = getProps(r)
      r = r1
      if (props && !import_from_vue.includes('defineProps')) {
        import_from_vue.push('defineProps')
      }
      const [emit, r2] = getEmit(r)
      r = r2
      if (emit.length && !import_from_vue.includes('defineEmits')) {
        import_from_vue.push('defineEmits')
      }
      const [setup, r3] = getSetup(r, import_from_vue)
      r = r3
      if (setup && !import_from_vue.includes('ref')) {
        import_from_vue.push('ref')
      }
      const [mounted, r4] = getMounted(r)
      r = r4
      if (mounted && !import_from_vue.includes('onMounted')) {
        import_from_vue.push('onMounted')
      }
      const [name, r5] = getName(r) // defineOptions
      r = r5

      result = '\n' + [name, props, emit, setup, mounted].join('\n')
      return result
    })
  } else if (EXPORTDEFAULT.test(scriptStr)) {
    scriptStr.replace(EXPORTDEFAULT, (_, r) => {
      const [props, r1] = getProps(r)
      r = r1
      if (props && !import_from_vue.includes('defineProps')) {
        import_from_vue.push('defineProps')
      }
      const [emit, r2] = getEmit(r)
      r = r2
      if (emit.length && !import_from_vue.includes('defineEmits')) {
        import_from_vue.push('defineEmits')
      }
      const [data, r3] = getData(r)
      r = r3

      if (data && !import_from_vue.includes('ref')) {
        import_from_vue.push('ref')
      }
      const [mounted, r4] = getMounted(r)
      r = r4
      if (mounted && !import_from_vue.includes('onMounted')) {
        import_from_vue.push('onMounted')
      }
      const [methods, r5] = getMethods(r)
      r = r5
      const [computed, r6] = getComputed(r)
      r = r6
      if (computed && !import_from_vue.includes('computed')) {
        import_from_vue.push('computed')
      }
      const [watch, r7] = getWatch(r, import_from_vue)
      r = r7
      const [name, r8] = getName(r) // defineOptions
      r = r8

      result = '\n' + [name, props, emit, data, watch, computed, methods, mounted].join('\n')
      return r
    })
  }
  const _import_ = `import { ${import_from_vue.join(', ')} } from 'vue'\n`

  return _import_ + result
}

function getName(r: string) {
  let name
  r = r.replace(NAME, (_: string, v: string) => {
    name = v
    return ''
  })
  if (name) {
    // defineOptions
    return [`defineOptions({
  name: ${name}
})`, r]
  }
  return [name, r]
}

function getProps(r: string) {
  let definePropsType = ''
  if (PROPSARRAY.test(r)) {
    r = r.replace(PROPSARRAY, (_: string, v: string) => {
      v.split(',').forEach(item => {
        item = item.replace(/['"]/g, '')
        definePropsType += `${item}: String;`
      })
      return ''
    })
  } else if (PROPS.test(r)) {
    r = r.replace(PROPS, (_: string, v: string) => {
      v = v.replace(PROPSHASAS, (_, v1, v2) => `${v1}: ${v2}`)
      definePropsType = trim(v, 'all').replace(',', ';')
      return ''
    })
  }
  if (definePropsType) {
    return [`const props = defineProps<{${definePropsType}}>()`, r]
  }
  return [definePropsType, r]
}

function getEmit(r: string) {
  const emit: string[] = []
  r = r.replace(MODELEVENT, (_: string, v: string) => {
    emit.push(trim(v, 'all'))
    return ''
  })
  r = r.replace(EMIT, (_: string, v: string) => {
    emit.push(trim(v, 'all'))
    return ''
  })
  if (emit.length) {
    return [`const emit = defineEmits(${emit.join(',')})`, r]
  }
  return [emit, r]

}

function getSetup(r: string, import_from_vue: string[]) {
  let setup
  r = r.replace(SETUP, (_: string, v: string) => {
    v = v.replace('expose(', () => {
      import_from_vue.push('defineExpose')
      return 'defineExpose('
    })
      .replace(RETURN, '')
    setup = tidy(v)
    return ''
  })
  return [setup, r]
}

function getMounted(r: string) {
  let result
  r = r.replace(MOUNTED, ((_: string, v: string) => {
    result = getThisTransform(v)
    return ''
  }))
  if (result) {
    return [`onMounted(()=>{\n${result}\n})`, r]
  }
  return [result, r]
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
  if (DATAFUNCTION.test(r)) {
    r = r.replace(DATAFUNCTION, (_, v) => {
      v.replace(DATAITEM, (_: string, key: string, val: string) => {
        if (val.endsWith(','))
          val = val.substring(0, val.length - 1)
        result += `const ${key.trim()} = ref(${val})\n`
        return v
      })
      return ''
    })
  } else if (DATA.test(r)) {
    r = r.replace(DATA, (_, v) => {
      v.replace(DATAITEM, (_: string, key: string, val: string) => {
        if (val.endsWith(','))
          val = val.substring(0, val.length - 1)
        result += `const ${key.trim()} = ref(${val})\n`
        return v
      })
      return ''
    })
  }
  return [result, r]
}

function getMethods(r: string) {
  let result
  r = r.replace(METHODS, (_, v) => {
    const space = '$__temp'
    v = v.replace(/,\n\s*/g, space)
    result = getThisTransform(v).split(space).map(item => `function ${item}`).join('\n')
    return ''
  })
  return [result, r]
}

function getThisTransform(r: string) {
  return tidy(r
    .replace(THISFN, (_, c) => c)
    .replace(THISDEEP, (_, v) => `${v}.value`))
}

function getComputed(r: string) {
  let result = ''
  r = r.replace(COMPUTED, (_, v) => {
    getThisTransform(v).replace(COMPUTEDITEM, (_, key, val) =>
      result += `const ${key} = computed(() => ${val})\n`)
    return ''
  })
  return [result, r]
}

function getWatch(r: string, import_from_vue: string[]) {
  let result: string = ''
  r = r.replace(WATCH, (_, v: string) => {
    import_from_vue.push('watch')
    getThisTransform(v).split(',\n').forEach(item => {
      item.replace(WATCHITEM, (_: string, key: string, params: string, val: string) => {
        const watch = `watch(${key}, ${params} => ${val})\n`
        result += watch
        return ''
      })
    })
    return ''
  })

  return [result, r]
}
