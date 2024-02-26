#! /bin/bash -e
# Activate virtualenv and execute the CLI args from supervisor

proj="/home/rer/sqlplatform"
proj_venv="$proj/venv/bin/activate"
if [ -f $proj_venv ]; then
    source $proj_venv
fi

# Execute the CLI args from supervisor
# See: ./sqlplatform/deployment/supervisor.conf
# i.e. command=bash ./run.sh gunicorn -c ./deployment/gunicorn.config.py wsgi:app
exec "$@"