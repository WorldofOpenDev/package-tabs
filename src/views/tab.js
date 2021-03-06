define(function() {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");

    var dnd = codebox.require("utils/dragdrop");
    var keyboard = codebox.require("utils/keyboard");
    var menu = codebox.require("utils/menu");

    var GridView = codebox.require("views/grid");

    // Tab header
    var TabView = hr.List.Item.extend({
        className: "component-tab",
        defaults: {
            title: "",
            tabid: "",
            close: true
        },
        events: {
            "mousedown .close": "close",
            "dblclick": "open",
            "click .close": "close",
            "click": "open",
        },
        states: {
            'modified':     "*",
            'warning':      "!",
            'offline':      "*",
            'sync':         "[-]",
            'loading':      "*"
        },

        // Constructor
        initialize: function() {
            TabView.__super__.initialize.apply(this, arguments);

            var that = this;
            var $document = $(document);

            // Drop tabs to order
            this.dropArea = new dnd.DropArea({
                view: this,
                dragType: this.model.manager.drag,
                handler: function(tab) {
                    var i = that.list.collection.indexOf(that.model);
                    var ib = that.list.collection.indexOf(tab);

                    if (ib >= 0 && ib < i) {
                        i = i - 1;
                    }
                    that.model.manager.changeTabSection(tab, that.list.collection.sectionId, {
                        at: i
                    });
                }
            });

            this.model.manager.drag.enableDrag({
                view: this,
                data: this.model,
                baseDropArea: this.list.dropArea,
                start: function() {
                    that.open();
                }
            });

            // Context menu
            if (this.model.manager.options.tabMenu) {
                menu.add(this.$el, _.compact([
                    (this.model.manager.options.newTab ? {
                        'label': "New Tab",
                        'click': function() {
                            that.model.manager.openDefault();
                        }
                    } : null),
                    (this.model.manager.options.newTab ? { 'type': "divider" } : null),
                    {
                        'label': "Close",
                        'click': function() {
                            that.close();
                        }
                    },
                    {
                        'label': "Close Other Tabs",
                        'click': function() {
                            that.closeOthers();
                        }
                    },
                    { 'type': "divider" },
                    {
                        'label': "New Group",
                        'click': function() {
                            that.model.splitSection();
                        }
                    },
                    { 'type': "divider" },
                    {
                        'type': "menu",
                        'label': "Layout",
                        'items': _.map(that.model.manager.options.layouts, function(value, key) {
                            return {
                                'label': key,
                                'click': function() {
                                    that.model.manager.setLayout(value);
                                }
                            }
                        })
                    }
                ]));
            }

            return this;
        },

        // Render the tab
        render: function() {
            this.$el.empty();

            var inner = $("<div>", {
                "class": "inner"
            }).appendTo(this.$el);

            var title = $("<span>", {
                "class": "title",
                "html": this.model.get("title")
            }).appendTo(inner);

            var states = this.model.get("state", "").split(" ");
            _.each(states, function(state) {
                if (state && this.states[state]) {
                    $("<span>", {
                        "class": "state  state-"+state,
                        "text": this.states[state]
                    }).prependTo(inner);
                }
            }, this);

            var icon = this.model.get("icon");
            if (icon) {
                $("<i>", {
                    "class": "icon octicon octicon-"+this.model.get("icon")
                }).prependTo(inner);
            }

            $("<a>", {
                "class": "close",
                "href": "#",
                "html": "&times;"
            }).prependTo(inner);

            this.$el.toggleClass("active", this.model.isActive());

            return this.ready();
        },

        // Return true if is active
        isActive: function() {
            return this.$el.hasClass("active");
        },

        // (event) open
        open: function(e) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.model.active();
        },

        // (event) close
        close: function(e) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.model.close();
        },

        // (event) close others tabs
        closeOthers: function(e) {
            this.model.closeOthers();
        }
    });

    return TabView;
});