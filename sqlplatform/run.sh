#! /bin/bash -e
# Activate virtualenv and then execute the script args

proj="/home/rer/sqlplatform"
proj_venv="$proj/venv/bin/activate"
if [ -f $proj_venv ]; then
    source $proj_venv
fi
exec "$@"