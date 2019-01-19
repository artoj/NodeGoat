#!/bin/bash
IFS=$'\n'
while read url
do
    curl -sL -w "%{http_code} $url -> %{url_effective}\\n" "$url" -o /dev/null
done
