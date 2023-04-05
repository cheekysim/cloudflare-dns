# Cloudflare DNS
This is a simple program to keep your cloudflare ip up to date with your public ip
Since cloudflare does not support dynamic ips, this is a workaround

This is meant to be used with portainer and deployed as a repository stack.
https://www.portainer.io/

# Config
The program is easy to configure, it just uses a few environment variables
These can easily be added when running the stack

## Environment Variables
```env
ZONE=Id of the zone to use
RECORD=Id of the record
TOKEN=API Token
```
## Get API Token
https://dash.cloudflare.com/profile/api-tokens
1. Create Token
2. Use Edit Zone DNS Template
3. Configure Zone Resources For The Zone To Use
4. Continue To Summary
5. Create Token

## Get Zone and Record
Run the program with the environment variable
```env
NODE_ENV=dev
```
This will then log all of the zones and records per zone,<br>
This provides you with the Zone and Record ID

Put these as the environment variables then remove
```env
NODE_ENV=dev
```
All should run well