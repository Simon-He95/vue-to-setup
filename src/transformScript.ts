import { trim } from 'lazy-js-utils'
const DEFINECOMPONENT = /^export default defineComponent\((.*})\)$/gms
const NAME = /name:\s*(['"\w]+)/
const PROPS = /props:\s*{[\s\n]*([\w:<>\s\[\],]+)}/gsm
const PROPSHASAS = /(\w+):\s*\w+\s*as\s*PropType<([\w\[\]]+)>/gsm
const EMIT = /emit:\s*(\[.*\])/gsm
export function transform(scriptStr: string): string {
  scriptStr.replace(DEFINECOMPONENT, (match, r) => {
    const name = getName(r) // defineOptions
    const props = getProps(r)
    console.log(props)
  })

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
    return `const props = defineProps<${definePropsType}>()`
  }
}
