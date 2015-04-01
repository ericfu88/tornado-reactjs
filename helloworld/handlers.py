#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Contains handlers that renders UI
from tornado.web import RequestHandler
import tornado.gen
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
import tornado.escape
import xml.sax.saxutils
import urlparse

class TemplateRendering:
    """
    A simple class to hold methods for rendering templates.
    """

    def render_template(self, template_name, **kwargs):
        template_dirs = []
        if self.settings.get("template_path", ""):
            template_dirs.append(self.settings["template_path"])
        env = Environment(loader=FileSystemLoader(template_dirs))
        try:
            template = env.get_template(template_name)
        except TemplateNotFound:
            raise TemplateNotFound(template_name)
        content = template.render(kwargs)
        return content


class BaseUIHandler(RequestHandler, TemplateRendering):
    def __init__(self, application, request, **kwargs):
        super(BaseUIHandler, self).__init__(application, request, **kwargs)

    """
    RequestHandler already has a `render()` method. I'm writing another
    method `render2()` and keeping the API almost same.
    """

    def render2(self, template_name, **kwargs):
        """
        This is for making some extra context variables available to
        the template
        """
        kwargs.update({
            "settings": self.settings,
            "STATIC_URL": self.settings.get("static_url_prefix", "/static/"),
            "request": self.request,
            "xsrf_token": self.xsrf_token,
            "xsrf_form_html": self.xsrf_form_html,
        })
        content = self.render_template(template_name, **kwargs)
        self.write(content)


class MainPage(BaseUIHandler):
    def get(self):
        kwargs = dict()
        return self.render2("main.html", **kwargs)
                
class SecondPage(BaseUIHandler):
    def get(self):
        kwargs = dict()
        return self.render2("secondpage.html", **kwargs)                