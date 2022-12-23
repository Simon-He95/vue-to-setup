import { trim } from 'lazy-js-utils'
const DEFINECOMPONENT = /^export default defineComponent\((.*})\)$/gms
const NAME = /name:\s*(['"\w]+)/
const PROPS = /props:\s*{[\s\n]*([\w:<>\s\[\],]+)}/gsm
const PROPSHASAS = /(\w+):\s*\w+\s*as\s*PropType<([\w\[\]]+)>/gsm
export function transform(scriptStr: string): string {
  scriptStr.replace(DEFINECOMPONENT, (match, r) => {
    let name
    r.replace(NAME, (_: string, v: string) => {
      name = v
    })
    if (name) {
      // defineOptions
      const _name = `
defineOptions({
  name: ${name}
})`
    }
    let definePropsType = ''
    r.replace(PROPS, (_: string, v: string) => {
      v = v.replace(PROPSHASAS, (_, v1, v2) => `${v1}: ${v2}`)
      definePropsType = trim(v, 'all').replace(',', ';')
    })
    let props = ''
    if (definePropsType) {
      props = `
const props = defineProps<${definePropsType}>()`
    }
    console.log(props)
  })

}
