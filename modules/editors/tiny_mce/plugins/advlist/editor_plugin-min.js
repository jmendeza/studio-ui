(function(){var b=tinymce.each;
tinymce.create("tinymce.plugins.AdvListPlugin",{init:function(a,h){var g=this;
g.editor=a;
function f(c){var d=[];
b(c.split(/,/),function(e){d.push({title:"advlist."+(e=="default"?"def":e.replace(/-/g,"_")),styles:{listStyleType:e=="default"?"":e}})
});
return d
}g.numlist=a.getParam("advlist_number_styles")||f("default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman");
g.bullist=a.getParam("advlist_bullet_styles")||f("default,circle,disc,square");
if(tinymce.isIE&&/MSIE [2-7]/.test(navigator.userAgent)){g.isIE7=true
}},createControl:function(o,a){var m=this,n,j,l=m.editor;
if(o=="numlist"||o=="bullist"){if(m[o][0].title=="advlist.def"){j=m[o][0]
}function p(e,c){var d=true;
b(c.styles,function(g,f){if(l.dom.getStyle(e,f)!=g){d=false;
return false
}});
return d
}function k(){var d,c=l.dom,e=l.selection;
d=c.getParent(e.getNode(),"ol,ul");
if(!d||d.nodeName==(o=="bullist"?"OL":"UL")||p(d,j)){l.execCommand(o=="bullist"?"InsertUnorderedList":"InsertOrderedList")
}if(j){d=c.getParent(e.getNode(),"ol,ul");
if(d){c.setStyles(d,j.styles);
d.removeAttribute("data-mce-style")
}}l.focus()
}n=a.createSplitButton(o,{title:"advanced."+o+"_desc","class":"mce_"+o,onclick:function(){k()
}});
n.onRenderMenu.add(function(d,c){c.onHideMenu.add(function(){if(m.bookmark){l.selection.moveToBookmark(m.bookmark);
m.bookmark=0
}});
c.onShowMenu.add(function(){var g=l.dom,e=g.getParent(l.selection.getNode(),"ol,ul"),f;
if(e||j){f=m[o];
b(c.items,function(i){var h=true;
i.setSelected(0);
if(e&&!i.isDisabled()){b(f,function(r){if(r.id==i.id){if(!p(e,r)){h=false;
return false
}}});
if(h){i.setSelected(1)
}}});
if(!e){c.items[j.id].setSelected(1)
}}l.focus();
if(tinymce.isIE){m.bookmark=l.selection.getBookmark(1)
}});
c.add({id:l.dom.uniqueId(),title:"advlist.types","class":"mceMenuItemTitle",titleItem:true}).setDisabled(1);
b(m[o],function(e){if(m.isIE7&&e.styles.listStyleType=="lower-greek"){return
}e.id=l.dom.uniqueId();
c.add({id:e.id,title:e.title,onclick:function(){j=e;
k()
}})
})
});
return n
}},getInfo:function(){return{longname:"Advanced lists",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/advlist",version:tinymce.majorVersion+"."+tinymce.minorVersion}
}});
tinymce.PluginManager.add("advlist",tinymce.plugins.AdvListPlugin)
})();