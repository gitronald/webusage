import os

def num_cpus():
    if not hasattr(os, "sysconf"):
        raise RuntimeError("No sysconf detected.")
    return os.sysconf("SC_NPROCESSORS_ONLN")

_ROOT = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..'))
_VAR = os.path.join(_ROOT, 'var')
_ETC = os.path.join(_ROOT, 'etc')
_LOG = os.path.join(_VAR, 'log', )

loglevel = 'info'
# errorlog = os.path.join(_LOG, 'sqlplatform-error.log')
# accesslog = os.path.join(_LOG, 'sqlplatform-access.log')
errorlog = "-"
accesslog = "-"

bind = 'localhost:5000'
workers = num_cpus() * 2 + 1 # 257

timeout = 3 * 60  # 3 minutes
keepalive = 24 * 60 * 60  # 1 day

capture_output = True
