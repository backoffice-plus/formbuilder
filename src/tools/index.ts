export * from './ObjectTool'
export * from './SchemaArrayTool'

import {ObjectTool}  from './ObjectTool'
import {SchemaArrayTool}  from './SchemaArrayTool'

export const defaultToolsNew = [
    ObjectTool.create(),
    SchemaArrayTool.create(),
]
