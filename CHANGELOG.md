# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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