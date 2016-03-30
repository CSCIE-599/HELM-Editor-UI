#! /bin/bash

cd `dirname $0`

# keep the old version
rm -rf backup
mv dist backup

# get our new one out
tar -zxf dist.tgz
rm dist.tgz
