#!/bin/bash
curl -s -X POST http://localhost:2019/config/apps/http/servers/srv0/routes -H "Content-Type: application/json" -d '{
  "handle": [{"handler": "subroute","routes": [{"handle": [{"handler": "reverse_proxy","upstreams": [{"dial": "localhost:3847"}]}]}]}],
  "match": [{"host": ["presentation-hub.46.62.210.62.sslip.io"]}],
  "terminal": true
}'
echo "Caddy route added for presentation-hub"
