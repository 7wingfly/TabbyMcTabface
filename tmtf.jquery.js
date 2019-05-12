//TabbyMcTabface Version 0.1
//Written by Benjamin Watkins
//watkins.ben@gmail.com

//TODO:
// Add max with support for tab headers
// Allow user to reference existing div for page
// Add global config in constructor for default settings.

(function ($) {
    var IDCount = 0;
    var tabSettings = [];
    var selectedIndex = null;
    var unselectedColorDefault = '#2c2c2c';
    var selectedColorDefault = '#ff6a00';
    var tabHeaderContainer = null;
    var tabPageContainer = null;    
    var tabHeaderContainerReserve = 50;

    $.fn.tabbyMcTabface = function (_tabSettings = []) {
        var tabbyMcTabfaceElement = this;

        // if (_tabSettings == null)
        //     _tabSettings = [];

        tabSettings = _tabSettings;

        tabHeaderContainer = $(this.selector + ' .TabHeaderContainer');
        tabPageContainer = $(this.selector + ' .TabPageContainer');

        if (!$(this).hasClass('TabbyMcTabface')) {
            $(this).addClass('TabbyMcTabface');
        }

        if (tabHeaderContainer[0] == null & tabPageContainer[0] == null) {
            var _tabHeaderContainer = document.createElement('div');
            _tabHeaderContainer.classList = 'TabHeaderContainer';
            this.append(_tabHeaderContainer);
            tabHeaderContainer = $(_tabHeaderContainer);
            var _tabPageContainer = document.createElement('div');
            _tabPageContainer.classList = 'TabPageContainer';
            this.append(_tabPageContainer);
            tabPageContainer = $(_tabPageContainer);
        }

        if (tabHeaderContainer[0] == null) {
            alert("Error. TabHeaderContainer is missing!");
            return this;
        }

        if (tabPageContainer[0] == null) {
            alert("Error. TabPageContainer is missing!");
            return this;
        }

        if (tabPageContainer.children().length > tabHeaderContainer.children().length) {
            alert("Error. Tab Headers are missing!");
            return this;
        }

        if (tabPageContainer.children().length < tabHeaderContainer.children().length) {
            alert("Error. Tab Pages are missing!");
            return this;
        }

        if (tabSettings.length != 0) {
            var selectedExists = false
            for (var i = 0; i < tabSettings.length; i++) {
                if (tabSettings[i].selected == true) {
                    if (!selectedExists)
                        selectedExists = true;
                    else {
                        console.log("Warning. More than one tab is marked as selected.");
                        tabSettings[i].selected = false;
                    }
                }
            }
        }

        for (var i = 0; i < tabHeaderContainer.children().length; i++) (function (i) {
            var tabHeader = tabHeaderContainer.children()[i];
            var btnClose = $(tabHeader).find('.TabHeaderBtnClose')[0];
            var lblTitle = $(tabHeader).find('.TabHeaderTitle')[0];

            if (i > tabSettings.length - 1) {
                console.log('No more tab configs. Creating new one.');
                tabSettings.push({
                    title: '',
                    closeable: false,
                    alwaysShowColor: false,
                })
            }

            if (tabSettings.length != 0) {
                if (lblTitle == null) {
                    lblTitle = document.createElement('p');
                    lblTitle.classList = 'TabHeaderTitle';
                    lblTitle.innerHTML = tabSettings[i].title != null ? tabSettings[i].title : '';
                    tabHeader.appendChild(lblTitle);
                }

                if (btnClose == null && tabSettings[i].closeable == true) {
                    btnClose = document.createElement('button');
                    btnClose.classList = 'TabHeaderBtnClose';
                    btnClose.innerHTML = 'x';
                    tabHeader.appendChild(btnClose);
                }

                if (tabSettings[i].alwaysShowColor == null || (tabSettings[i].alwaysShowColor != null && tabSettings[i].alwaysShowColor == false)) {
                    tabHeader.onmouseenter = function () { $(tabHeader).css('border-bottom-color', tabSettings[$(tabHeader).index()].selectedColor != null ? tabSettings[$(tabHeader).index()].selectedColor : selectedColorDefault); };
                    tabHeader.onmouseleave = function () { if (!$(tabHeader).hasClass('SelectedTab')) $(tabHeader).css('border-bottom-color', tabSettings[i].unselectedColor != null ? tabSettings[i].unselectedColor : unselectedColorDefault); };
                }
                else if (tabSettings[i].alwaysShowColor != null && tabSettings[i].alwaysShowColor == true) {
                    $(tabHeader).css('border-bottom-color', tabSettings[i].selectedColor != null ? tabSettings[i].selectedColor : selectedColorDefault);
                }
                else {
                    $(tabHeader).css('border-bottom-color', tabSettings[i].unselectedColor != null ? tabSettings[i].unselectedColor : unselectedColorDefault);
                }
            }

            tabHeader.onclick = function () {
                tabbyMcTabfaceElement.tabbyMcTabface_Select($(tabHeader).index());
            }

            if (btnClose != null)
                btnClose.onclick = function (e) {
                    tabbyMcTabfaceElement.tabbyMcTabface_CloseTab($(tabHeader).index());
                    e.stopPropagation();
                    return false;
                }
        })(i);

        if (tabSettings.length != 0 && tabSettings.length > tabHeaderContainer.children().length)
            for (var i = tabHeaderContainer.children().length; i < tabSettings.length; i++) {
                tabbyMcTabfaceElement.tabbyMcTabface_AddTab(tabSettings[i], false);
            }

        if (tabSettings.length != 0) {
            for (var i = 0; i < tabSettings.length; i++) {
                if (tabSettings[i].selected == true)
                    tabbyMcTabfaceElement.tabbyMcTabface_Select(i, false);
            }
        }

        if (selectedIndex == null)
            tabbyMcTabfaceElement.tabbyMcTabface_Select(0, false);

        var previouswidth = tabPageContainer.width()
        setInterval(function () {
            if (tabPageContainer.width() != previouswidth) {
                previouswidth = tabPageContainer.width();
                tabPageContainer.scrollLeft((tabPageContainer.width() * selectedIndex));
            }
        }, 0);

        this.tabbyMcTabface_UpdateTabHeaderSize();
    };

    $.fn.tabbyMcTabface_Select = function (index, animate) {
        if (index < 0 || index > tabHeaderContainer.children().length - 1)
            return false;

        animate = animate == null ? true : animate;
        var previousSelectedIndex = selectedIndex;
        selectedIndex = index;

        var tabHeader = tabHeaderContainer.children()[index];
        var tabPage = tabPageContainer.children()[index];

        tabHeader.classList.add('SelectedTab');

        if (animate)
            tabPageContainer.animate({ scrollLeft: (tabPageContainer.width() * index) });
        else
            tabPageContainer.scrollLeft((tabPageContainer.width() * index));

        for (var t = 0; t < tabHeaderContainer.children().length; t++) {
            if (tabHeaderContainer.children()[t] != tabHeader) {
                tabHeaderContainer.children()[t].classList.remove('SelectedTab');
            }
        }

        if (tabSettings.length != 0) {
            for (var i = 0; i < tabHeaderContainer.children().length; i++) {
                if (tabSettings[i].alwaysShowColor == null || (tabSettings[i].alwaysShowColor != null && tabSettings[i].alwaysShowColor == false)) {
                    $(tabHeaderContainer.children()[i]).css('border-color', tabSettings[i].unselectedColor != null ? tabSettings[i].unselectedColor : unselectedColorDefault);
                }
            }

            if (tabSettings[index].selectedColor != null) {
                $(tabHeader).css('border-color', tabSettings[index].selectedColor);
                tabHeaderContainer.animate({ borderColor: $(tabHeader).css('border-top-color') })
            }
            else {
                $(tabHeader).css('border-color', selectedColorDefault);
                tabHeaderContainer.animate({ borderColor: selectedColorDefault })
            }

            if (previousSelectedIndex != null && tabSettings[previousSelectedIndex] != null && tabSettings[previousSelectedIndex].onUnselected != null)
                tabSettings[previousSelectedIndex].onUnselected();

            if (tabSettings[index].onSelected != null)
                tabSettings[index].onSelected();
        }
    }

    $.fn.tabbyMcTabface_SelectNext = function (animate) {
        animate = animate == null ? true : animate;

        if (selectedIndex != tabHeaderContainer.children().length - 1)
            this.tabbyMcTabface_Select(selectedIndex + 1, animate);

        return selectedIndex;
    }

    $.fn.tabbyMcTabface_SelectPrevious = function (animate) {
        animate = animate == null ? true : animate;

        if (selectedIndex != 0)
            this.tabbyMcTabface_Select(selectedIndex - 1, animate);

        return selectedIndex;
    }

    $.fn.tabbyMcTabface_CloseTab = function (index) {
        var TotalTabIndex = tabHeaderContainer.children().length - 1;

        if (index <= TotalTabIndex) {
            var tabHeader = tabHeaderContainer.children()[index];
            var tabPage = tabPageContainer.children()[index];

            $(tabHeader).remove();
            $(tabPage).remove();

            if (tabSettings.length != 0) {
                if (tabSettings[index].onClosed != null)
                    tabSettings[index].onClosed();
                tabSettings.splice(index, 1);
            }

            TotalTabIndex--;

            if (TotalTabIndex >= 0) {
                if (selectedIndex == index && selectedIndex == 0)
                    this.tabbyMcTabface_Select(0);
                else if (selectedIndex == index && selectedIndex == TotalTabIndex + 1)
                    this.tabbyMcTabface_Select(TotalTabIndex);
                else if (selectedIndex == index)
                    this.tabbyMcTabface_Select(index);
                else if (index < selectedIndex)
                    this.tabbyMcTabface_Select(selectedIndex - 1, false);
            }
        }
    }

    $.fn.tabbyMcTabface_AddTab = function (newTab, saveSettings = true) {
        var tabbyMcTabfaceElement = this;

        if (newTab == null) {
            alert("Error. newTab object paramter is missing!");
            return this;
        }

        if (saveSettings)
            tabSettings.push(newTab);

        var tabHeader = document.createElement('div');
        var tabPage = document.createElement('div');
        var lblTitle = document.createElement('p');
        var btnClose = document.createElement('button');

        if (newTab.id == null)
            tabPage.id = "TabPage" + IDCount++;
        else
            tabPage.id = newTab.id;

        tabHeader.className = 'TabHeader';
        tabPage.className = 'TabPage';
        lblTitle.className = 'TabHeaderTitle';
        btnClose.className = 'TabHeaderBtnClose';

        lblTitle.innerHTML = newTab.title != null ? newTab.title : '';
        btnClose.innerHTML = 'x';

        if (newTab.alwaysShowColor == null || (newTab.alwaysShowColor != null && newTab.alwaysShowColor == false)) {
            tabHeader.onmouseenter = function () { $(tabHeader).css('border-color', tabSettings[$(tabHeader).index()].selectedColor != null ? tabSettings[$(tabHeader).index()].selectedColor : selectedColorDefault); };
            tabHeader.onmouseleave = function () { if (!$(tabHeader).hasClass('SelectedTab')) $(tabHeader).css('border-color', newTab.unselectedColor != null ? newTab.unselectedColor : unselectedColorDefault); };
        }
        else if (newTab.alwaysShowColor != null && newTab.alwaysShowColor == true) {            
            $(tabHeader).css('border-color', newTab.selectedColor != null ? newTab.selectedColor : selectedColorDefault);
        }

        tabHeader.onclick = function () {
            tabbyMcTabfaceElement.tabbyMcTabface_Select($(tabHeader).index());
        }

        btnClose.onclick = function (e) {
            tabbyMcTabfaceElement.tabbyMcTabface_CloseTab($(tabHeader).index());
            e.stopPropagation();
            return false;
        }

        $(tabHeaderContainer).append(tabHeader);
        $(tabPageContainer).append(tabPage);

        tabHeader.appendChild(lblTitle);

        if (newTab.closeable != null && newTab.closeable)
            tabHeader.appendChild(btnClose);

        if (newTab.selected != null && newTab.selected)
            tabbyMcTabfaceElement.tabbyMcTabface_Select(tabHeaderContainer.children().length - 1);

        if (selectedIndex == null)
            tabbyMcTabfaceElement.tabbyMcTabface_Select(0, false);

        tabbyMcTabfaceElement.tabbyMcTabface_UpdateTabHeaderSize();

        return tabPage;
    }

    $.fn.tabbyMcTabface_GetSelectedTabIndex = function () {
        return selectedIndex;
    }

    $.fn.tabbyMcTabface_GetTabCount = function () {
        return tabHeaderContainer.children().length;
    }

    $.fn.tabbyMcTabface_EditTabTitle = function (index, title) {
        var tabHeader = tabHeaderContainer.children()[index];
        var lblTitle = $(tabHeader).find('.TabHeaderTitle')[0];
        lblTitle.innerHTML = title;
    }

    $.fn.tabbyMcTabface_UpdateTabHeaderSize = function () {
        var percentage = ((100 - tabHeaderContainerReserve) / tabHeaderContainer.children().length)
        tabHeaderContainer.children().each(function () {
            $(this).css('width', 'calc(' + percentage + "% - 5px)");
        });
    }

})(jQuery);