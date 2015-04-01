import helloworld.handlers
import os
import tornado.web
import jinja2
import tornado.options

tornado.options.define("port", default=8080, help="run on the given port", type=int)
tornado.options.define("env", default="dev", help="default runtime environment")
tornado.options.define("debug", default=False, help="Debug mode", type=bool)
tornado.options.define("ssl_enabled", default=False, help="Turn of SSL", type=bool)


class HelloWorldApplication(tornado.web.Application):
    def __init__(self):
        app_location = os.path.dirname(__file__)
        isDebug = tornado.options.options.debug
        if isDebug:
            appPath = "build"
        else:
            appPath = "dist"

        static_path = os.path.join(app_location, "client", appPath, "static")
        template_path = os.path.join(app_location, "client", appPath, "templates")

        handlers = [            
            (r"/page1", helloworld.handlers.SecondPage),  #  second page
            # =============== Static ===============
            (r"/static/(.*)", tornado.web.StaticFileHandler),
            # =============== Main ===============
            (r"/", helloworld.handlers.MainPage)  #  main page
        ]

        settings = {
            "debug": tornado.options.options.debug,
            "https_only": tornado.options.options.ssl_enabled,
            "static_path": static_path,
            "template_path": template_path
        }

        super(HelloWorldApplication, self).__init__(handlers, **settings)
        self.env = jinja2.Environment(loader=jinja2.FileSystemLoader(template_path))
