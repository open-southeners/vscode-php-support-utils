export const EXT_OUTPUT_CHANNEL_NAME = 'PHP Support Utils';

export const PHP_OBJECT_TYPES = ['class', 'enum', 'trait', 'interface'] as const;
export const PHP_OBJECT_MODIFIERS = ['extends', 'implements'] as const;

export const PHP_VIRTUAL_SEPARATOR = '\\';
export const PHP_VIRTUAL_TRAILING_SEPARATOR_REGEXP = new RegExp(`${PHP_VIRTUAL_SEPARATOR}$`);
export const PHP_VIRTUAL_PATH_VALIDATOR = new RegExp('^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*$');