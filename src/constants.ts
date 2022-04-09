export const EXT_OUTPUT_CHANNEL_NAME = 'PHP Support Utils'

export const PHP_OBJECT_TYPES = ['class', 'enum', 'trait', 'interface'] as const
export const PHP_OBJECT_MODIFIERS = ['extends', 'implements'] as const

export const PHP_VIRTUAL_SEPARATOR = '\\'
export const PHP_VIRTUAL_TRAILING_SEPARATOR_REGEXP = new RegExp(`${PHP_VIRTUAL_SEPARATOR}$`)
