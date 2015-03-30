import sys

from helloworld import app
import tornado.httpserver
import tornado.ioloop
from tornado.options import options, parse_command_line
from os.path import dirname, join

app_root = dirname(__file__)
try:
    import SITENAME
    assert SITENAME  # silence pyflakes
except ImportError:
    sys.path.append(app_root)


def main():
    parse_command_line()
    options.parse_config_file(join(app_root, "conf/%s/server.conf" % options.env))


    http_server = tornado.httpserver.HTTPServer(app.HelloWorldApplication(), xheaders=True)
    http_server.listen(options.port, "0.0.0.0")

    print("Starting Tornado with config {0} on http://localhost:{1}/".format(options.env, options.port))
    try:
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        sys.exit(0)


if __name__ == "__main__":
    main()