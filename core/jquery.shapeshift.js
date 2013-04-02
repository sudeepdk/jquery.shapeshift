// Generated by CoffeeScript 1.4.0
(function() {

  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "shapeshift";
    defaults = {
      enableResize: true,
      animated: true,
      animateOnInit: true,
      animationSpeed: 120,
      animationThreshold: 150,
      align: "center",
      autoHeight: true,
      columns: null,
      minColumns: 1,
      height: 200,
      gutterX: 10,
      gutterY: 10,
      maxHeight: null,
      minHeight: 100,
      paddingX: 10,
      paddingY: 10,
      fillerThreshold: 10,
      selector: ""
    };
    Plugin = (function() {

      function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.globals = {};
        this.$container = $(element);
        this.errorDetection();
        this.init();
      }

      Plugin.prototype.errorDetection = function() {
        var message, options;
        options = this.options;
        message = "Shapeshift ERROR: ";
        if (options.animated && !jQuery.ui) {
          console.error(message + "You are trying to enable animation however jQuery UI has not loaded yet.");
        }
        if (!options.autoHeight && !options.height) {
          return console.error(message + "You must specify a height if autoHeight is turned off.");
        }
      };

      Plugin.prototype.init = function() {
        this.setIdentifier();
        this.createEvents();
        this.enableFeatures();
        this.setGlobals();
        this.render(true);
        return this.afterInit();
      };

      Plugin.prototype.setIdentifier = function() {
        this.identifier = "shapeshifted_container_" + Math.random().toString(36).substring(7);
        return this.$container.addClass(this.identifier);
      };

      Plugin.prototype.createEvents = function() {
        var $container, options,
          _this = this;
        options = this.options;
        $container = this.$container;
        $container.off("ss-arrange").on("ss-arrange", function() {
          return _this.render(true);
        });
        $container.off("ss-destroy").on("ss-destroy", function() {
          return _this.destroy();
        });
        return $container.off("ss-destroyAll").on("ss-destroyAll", function() {
          return _this.destroy(true);
        });
      };

      Plugin.prototype.enableFeatures = function() {
        if (this.options.enableResize) {
          return this.resize();
        }
      };

      Plugin.prototype.setGlobals = function() {
        return this.globals.animated = this.options.animateOnInit;
      };

      Plugin.prototype.parseChildren = function() {
        var $child, $children, child, i, parsedChildren, _i, _ref;
        $children = this.$container.children(this.options.selector).filter(":visible");
        parsedChildren = [];
        for (i = _i = 0, _ref = $children.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          $child = $children.eq(i);
          child = {
            i: i,
            el: $child,
            colspan: $child.data("ss-colspan"),
            height: $child.outerHeight()
          };
          parsedChildren.push(child);
        }
        return this.parsedChildren = parsedChildren;
      };

      Plugin.prototype.afterInit = function() {
        return this.globals.animated = this.options.animated;
      };

      Plugin.prototype.render = function(full_render) {
        if (full_render) {
          this.parseChildren();
        }
        this.setGrid();
        return this.arrange();
      };

      Plugin.prototype.setGrid = function() {
        var children_count, col_width, columns, fc_colspan, fc_width, first_child, grid_width, gutterX, inner_width, minColumns, paddingX, single_width;
        gutterX = this.options.gutterX;
        paddingX = this.options.paddingX;
        inner_width = this.$container.width() - (paddingX * 2);
        first_child = this.parsedChildren[0];
        fc_width = first_child.el.outerWidth();
        fc_colspan = first_child.colspan;
        single_width = (fc_width - ((fc_colspan - 1) * gutterX)) / fc_colspan;
        this.globals.col_width = col_width = single_width + gutterX;
        minColumns = this.options.minColumns;
        columns = this.options.columns || Math.floor((inner_width + gutterX) / col_width);
        if (minColumns && minColumns > columns) {
          columns = minColumns;
        }
        this.globals.columns = columns;
        children_count = this.parsedChildren.length;
        if (columns > children_count) {
          columns = children_count;
        }
        this.globals.child_offset = paddingX;
        switch (this.options.align) {
          case "center":
            grid_width = (columns * col_width) - gutterX;
            return this.globals.child_offset += (inner_width - grid_width) / 2;
          case "right":
            grid_width = (columns * col_width) - gutterX;
            return this.globals.child_offset += inner_width - grid_width;
        }
      };

      Plugin.prototype.arrange = function() {
        var $child, attributes, container_height, i, maxHeight, minHeight, positions, _i, _ref;
        positions = this.getPositions();
        for (i = _i = 0, _ref = positions.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          $child = this.parsedChildren[i].el;
          attributes = positions[i];
          if (this.globals.animated && this.parsedChildren.length <= this.options.animationThreshold) {
            $child.stop(true, false).animate(attributes, this.options.animationSpeed);
          } else {
            $child.css(attributes);
          }
        }
        if (this.options.autoHeight) {
          container_height = this.globals.container_height;
          maxHeight = this.options.maxHeight;
          minHeight = this.options.minHeight;
          if (minHeight && container_height < minHeight) {
            container_height = minHeight;
          } else if (maxHeight && container_height > maxHeight) {
            container_height = maxHeight;
          }
          return this.$container.height(container_height);
        } else {
          return this.$container.height(this.options.height);
        }
      };

      Plugin.prototype.getPositions = function() {
        var col_heights, current_i, determineMultiposition, determinePositions, grid_height, gutterY, i, paddingY, positions, recalculateSavedChildren, savePosition, savedChildren, _i, _ref,
          _this = this;
        gutterY = this.options.gutterY;
        paddingY = this.options.paddingY;
        col_heights = [];
        for (i = _i = 0, _ref = this.globals.columns; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          col_heights.push(paddingY);
        }
        positions = [];
        savedChildren = [];
        current_i = 0;
        determineMultiposition = function(child) {
          var chosen_col, col, difference, filler_child, filler_cutoff, filler_i, filler_threshold, height, highest, kosher, next_height, offset, possible_col_heights, possible_cols, span, total_children, _j, _k, _l, _m, _n, _ref1, _ref2, _ref3, _ref4, _ref5;
          possible_cols = col_heights.length - child.colspan + 1;
          possible_col_heights = col_heights.slice(0).splice(0, possible_cols);
          total_children = _this.parsedChildren.length;
          filler_threshold = _this.options.fillerThreshold;
          filler_cutoff = child.i + filler_threshold;
          if (filler_cutoff > total_children) {
            filler_cutoff = total_children;
          }
          chosen_col = void 0;
          if (current_i <= filler_cutoff) {
            for (offset = _j = 0, _ref1 = possible_cols - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; offset = 0 <= _ref1 ? ++_j : --_j) {
              col = _this.lowestCol(possible_col_heights, offset);
              height = col_heights[col];
              kosher = true;
              for (span = _k = 1, _ref2 = child.colspan; 1 <= _ref2 ? _k < _ref2 : _k > _ref2; span = 1 <= _ref2 ? ++_k : --_k) {
                next_height = col_heights[col + span];
                if (height < next_height) {
                  kosher = false;
                  break;
                }
                difference = height - next_height;
                for (filler_i = _l = _ref3 = current_i + 1; _ref3 <= filler_cutoff ? _l < filler_cutoff : _l > filler_cutoff; filler_i = _ref3 <= filler_cutoff ? ++_l : --_l) {
                  filler_child = _this.parsedChildren[filler_i];
                  if (difference >= filler_child.height) {
                    kosher = false;
                    break;
                  }
                }
              }
              if (kosher) {
                chosen_col = col;
                break;
              }
            }
          } else {
            chosen_col = _this.lowestCol(possible_col_heights);
            highest = 0;
            for (span = _m = 1, _ref4 = child.colspan; 1 <= _ref4 ? _m < _ref4 : _m > _ref4; span = 1 <= _ref4 ? ++_m : --_m) {
              next_height = col_heights[chosen_col + span];
              if (next_height > highest) {
                highest = next_height;
              }
            }
            for (span = _n = 0, _ref5 = child.colspan; 0 <= _ref5 ? _n < _ref5 : _n > _ref5; span = 0 <= _ref5 ? ++_n : --_n) {
              col_heights[chosen_col + span] = highest;
            }
          }
          return chosen_col;
        };
        recalculateSavedChildren = function() {
          var index, pop_i, saved_child, saved_i, to_pop, _j, _k, _ref1, _ref2, _results;
          to_pop = [];
          for (saved_i = _j = 0, _ref1 = savedChildren.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; saved_i = 0 <= _ref1 ? ++_j : --_j) {
            saved_child = savedChildren[saved_i];
            saved_child.col = determineMultiposition(saved_child);
            if (saved_child.col >= 0) {
              savePosition(saved_child);
              to_pop.push(saved_i);
            }
          }
          _results = [];
          for (pop_i = _k = _ref2 = to_pop.length - 1; _k >= 0; pop_i = _k += -1) {
            index = to_pop[pop_i];
            _results.push(savedChildren.splice(index, 1));
          }
          return _results;
        };
        savePosition = function(child) {
          var col, j, offsetX, offsetY, _j, _ref1, _results;
          col = child.col;
          offsetX = (child.col * _this.globals.col_width) + _this.globals.child_offset;
          offsetY = col_heights[col];
          positions[child.i] = {
            left: offsetX,
            top: offsetY
          };
          col_heights[col] += child.height + gutterY;
          if (child.colspan >= 1) {
            _results = [];
            for (j = _j = 1, _ref1 = child.colspan; 1 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 1 <= _ref1 ? ++_j : --_j) {
              _results.push(col_heights[col + j] = col_heights[col]);
            }
            return _results;
          }
        };
        (determinePositions = function() {
          var child, _j, _ref1, _results;
          _results = [];
          for (i = _j = 0, _ref1 = _this.parsedChildren.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            child = _this.parsedChildren[i];
            if (child.colspan > 1) {
              child.col = determineMultiposition(child);
            } else {
              child.col = _this.lowestCol(col_heights);
            }
            if (child.col === void 0) {
              savedChildren.push(child);
            } else {
              savePosition(child);
            }
            recalculateSavedChildren();
            _results.push(current_i++);
          }
          return _results;
        })();
        if (this.options.autoHeight) {
          grid_height = col_heights[this.highestCol(col_heights)] - gutterY;
          this.globals.container_height = grid_height + paddingY;
        }
        return positions;
      };

      Plugin.prototype.resize = function() {
        var $container, animation_speed, binding, resizing,
          _this = this;
        $container = this.$container;
        animation_speed = this.options.animationSpeed;
        resizing = false;
        binding = "resize." + this.identifier;
        return $(window).on(binding, function() {
          if (!resizing) {
            resizing = true;
            setTimeout((function() {
              return _this.render();
            }), animation_speed / 2);
            setTimeout((function() {
              return _this.render();
            }), animation_speed);
            return setTimeout(function() {
              resizing = false;
              return _this.render();
            }, animation_speed * 1.5);
          }
        });
      };

      Plugin.prototype.lowestCol = function(array, offset) {
        var augmented_array;
        if (offset == null) {
          offset = 0;
        }
        augmented_array = array.map(function(val, index) {
          return [val, index];
        });
        augmented_array.sort(function(a, b) {
          var ret;
          ret = a[0] - b[0];
          if (ret === 0) {
            ret = a[1] - b[1];
          }
          return ret;
        });
        return augmented_array[offset][1];
      };

      Plugin.prototype.highestCol = function(array, span) {
        var max;
        if (span) {
          max = array.length - span + 1;
          if (max > span) {
            array = array.slice(0).splice(0, max);
          } else {
            array = array.slice(0).splice(0, 1);
          }
        }
        return $.inArray(Math.max.apply(window, array), array);
      };

      Plugin.prototype.destroy = function(revertChildren) {
        var bound_indentifier, old_class, _ref;
        this.$container.off("ss-arrange");
        this.$container.off("ss-destroy");
        this.$container.off("ss-destroyAll");
        if (revertChildren) {
          this.$container.children().each(function() {
            return $(this).css({
              left: 0,
              top: 0
            });
          });
        }
        old_class = (_ref = $(this).attr("class").match(/shapeshifted_container_\w+/)) != null ? _ref[0] : void 0;
        bound_indentifier = "resize." + old_class;
        $(window).off(bound_indentifier);
        $(this).removeClass(old_class);
        return console.info("Shapeshift has been successfully destroyed on container:", this.$container);
      };

      return Plugin;

    })();
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        var bound_indentifier, old_class, _ref;
        old_class = (_ref = $(this).attr("class").match(/shapeshifted_container_\w+/)) != null ? _ref[0] : void 0;
        if (old_class) {
          bound_indentifier = "resize." + old_class;
          $(window).off(bound_indentifier);
          $(this).removeClass(old_class);
        }
        return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      });
    };
  })(jQuery, window, document);

}).call(this);
