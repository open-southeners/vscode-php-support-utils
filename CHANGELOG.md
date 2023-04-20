# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.4] - 2023-04-20

### Fixed

- New PHP file adding an "undefined.php" file when no text was introduced
- Extra validation on new PHP file option

## [1.1.3] - 2022-04-21

### Fixed

- Namespace guess with wrong formatting

### Added

- Internal sanitization to namespaces
- Some unit tests (work in progress...)

## [1.1.2] - 2022-04-10

### Added

- New command `php-support-utils.newObject` for create a object with multiple choices (class, trait, interface, enum)
- Github workflow for automate tests & publishing

### Fixed

- Futher fixes to objects creation

## [1.1.1] - 2022-04-09

### Changed

- Minor changes to the published app (adding icon, etc...)

## [1.1.0] - 2022-04-09

### Added

- First package release!

## Changed

- Contextual snippets [thanks to this extension](https://marketplace.visualstudio.com/items?itemName=brpaz.contextual-snips)
- Major refactor to all extension's internal API

## Fixed

- Wrong namespace on new file creation when using [namespace mapping with Composer](https://getcomposer.org/doc/04-schema.md#autoload)
- When creating a file or object file it appends if there is already an existing file with the same name
- Other minor fixes around file creation

## [1.0.0] - 2022-04-08

### Added

- Initial pre-release! 