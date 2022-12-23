import fg from 'fast-glob'
import path from 'path'
import fsp from 'fs/promises'
import { parse, compileScript, babelParse } from 'vue/compiler-sfc'
import { transform } from './transformScript'
export async function setup() {
  const fileDir = process.argv[2]
  const url = path.resolve(process.cwd(), fileDir)
  const entries = await fg(['**.vue'], {
    cwd: url
  })
  if (!entries.length) return
  entries.forEach(async _path => {
    const _url = path.resolve(url, _path)
    const source = await fsp.readFile(_url, 'utf-8')
    const id = _url
    const { descriptor } = parse(source);

    if (!descriptor.script || descriptor.scriptSetup) return
    const { script, styles, template } = descriptor
    const styleStr = styles[0].content
    const templateStr = template?.content || ''
    const scriptStr = script.content

    const { scoped, lang } = styles[0]
    const _style = `\n<style ${scoped ? 'scoped ' : ''}${lang ? `lang="${lang}"` : ''}>${styleStr}</style>`
    const _template = `\n<template>${templateStr}</template>\n`
    const _script = `<script setup${script.lang ? ` lang="${script.lang}"` : ''}>${transform(scriptStr)}\n</script>\n`
    const result = _script + _template + _style
    console.log(result);

  })
}


setup()
