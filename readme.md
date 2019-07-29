# nyaa.si bot

![GitHub package.json version](https://img.shields.io/github/package-json/v/ejnshtein/nyaasi-bot?style=flat-square)
[![telegram channel](https://img.shields.io/badge/telegram-channel-blue.svg?style=flat-square)](https://t.me/nyaasi)
[![telegram chat](https://img.shields.io/badge/telegram-chat-blue.svg?style=flat-square)](https://t.me/nyaasi_chat)
[![nyaa.si bot](https://img.shields.io/badge/nyaa.si-bot-blue.svg?style=flat-square)](https://t.me/nyaasi_bot)  
It's my implementation of bot for [Nyaa.si](https://nyaa.si) in [Telegram](https://telegram.org) powered by [Telegraf](https://github.com/telegraf/telegraf).  
Bot in telegram - [nyaa.si bot](https://t.me/nyaasi_bot)  
RSS channel - [Nyaa.si](https://t.me/nyaasi)  

## Features

- Search on nyaa.si
- Full torrent information
- Download `.torrent` file right in telegram chat
- Magnet links too
- Share torrent in other chats
- Download torrent files up to 1.5 gb in Telegram
- Send link to torrent on nyaa in any chat where [@nyaasi_bot](https://t.me/nyaasi_bot) is and get metadata*

\* In public chat you wouldn't be available to navigation on nyaa. It will look like [this](https://t.me/ithinkitsok/56).

## In progress

- Custom RSS feed (?)
- Custom distributed network for worker queue optimization.

## Commands

Here's 2 main commands:

- `/index` - Get access to nyaa.si index page (same as open [nyaa.si](https://nyaa.si/) in browser)
- `/search` - Same as `/index` but here you can write your query for [nyaa.si](https://nyaa.si), like this: `/search dr.stone`

### NOTE

This commands works only in chat with bot

## Inline mode

[<img src="https://i.imgur.com/5VVUAv4.png" height="400">](https://t.me/nyaasi_bot)[<img src="https://i.imgur.com/S3nwDbf.png" height="400">](https://t.me/nyaasi_bot)  
Type in any chat **@nyaasi_bot** and it will work!
