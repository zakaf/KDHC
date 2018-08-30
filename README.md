# <a href="http://www.dongkeunlee.com">KDHC</a>

> News feed like responsive single-page application based on Scrapy, Express, ReactJS and Semantic UI

[![Build Status](https://travis-ci.org/ldkz2524/KDHC.svg?branch=master)](https://travis-ci.org/ldkz2524/KDHC)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![KDHC News Card](https://s3.ap-northeast-2.amazonaws.com/kdhc-auth0/MainPage.PNG)

## Table of Contents

- [Features](#features)
- [Technology](#technology)
- [Improvement](#improvement)
- [Support](#support)
- [License](#license)

---

## Features

### News Card

<img src="https://raw.githubusercontent.com/ldkz2524/KDHC/master/etc/newsCard.gif" width="572" height="589">
<img src="https://raw.githubusercontent.com/ldkz2524/KDHC/master/etc/newsCardMobile.gif" width="285" height="589">

- View news crawled using the keywords people / you've added

### Keyword Card

<img src="https://raw.githubusercontent.com/ldkz2524/KDHC/master/etc/keywordCard.gif" width="572" height="589">
<img src="https://raw.githubusercontent.com/ldkz2524/KDHC/master/etc/keywordCardMobile.gif" width="285" height="589">

- View news grouped by the keywords people / you've added

### Manage keywords

<img src="https://raw.githubusercontent.com/ldkz2524/KDHC/master/etc/manageKeyword.gif" width="572" height="589">

- List keywords you've added

- Add a keyword with the matching search term

- Delete a keyword that you've added in the past

## Technology

> Diagram of application configuration to be added

### Crawler

- Python + Scrapy

### Application

- **Back-End**

  - Server
    - Express + Morgan + Auth0 (JWT + JWKS)

  - Data Store
  
    - Redis + MySQL (AWS RDBMS)

  - Test Automation

    - Mocha + Chai

- **Front-End**

  - React.js + Semantic UI

## Improvement

## Support

- Contact me at <mlb.oakland@gmail.com>

## License

- [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
- Copyright 2018 © <a href="https://github.com/ldkz2524" target="_blank">DONGKEUN LEE</a>.
