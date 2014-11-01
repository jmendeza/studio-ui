(function(){var b=tinymce.DOM;
tinymce.ThemeManager.requireLangPack("simple");
tinymce.create("tinymce.themes.SimpleTheme",{init:function(j,i){var h=this,a=["Bold","Italic","Underline","Strikethrough","InsertUnorderedList","InsertOrderedList"],g=j.settings;
h.editor=j;
j.contentCSS.push(i+"/skins/"+g.skin+"/content.css");
j.onInit.add(function(){j.onNodeChange.add(function(c,d){tinymce.each(a,function(e){d.get(e.toLowerCase()).setActive(c.queryCommandState(e))
})
})
});
b.loadCSS((g.editor_css?j.documentBaseURI.toAbsolute(g.editor_css):"")||i+"/skins/"+g.skin+"/ui.css")
},renderUI:function(k){var n=this,j=k.targetNode,a,p,o=n.editor,m=o.controlManager,l;
j=b.insertAfter(b.create("span",{id:o.id+"_container","class":"mceEditor "+o.settings.skin+"SimpleSkin"}),j);
j=l=b.add(j,"table",{cellPadding:0,cellSpacing:0,"class":"mceLayout"});
j=p=b.add(j,"tbody");
j=b.add(p,"tr");
j=a=b.add(b.add(j,"td"),"div",{"class":"mceIframeContainer"});
j=b.add(b.add(p,"tr",{"class":"last"}),"td",{"class":"mceToolbar mceLast",align:"center"});
p=n.toolbar=m.createToolbar("tools1");
p.add(m.createButton("bold",{title:"simple.bold_desc",cmd:"Bold"}));
p.add(m.createButton("italic",{title:"simple.italic_desc",cmd:"Italic"}));
p.add(m.createButton("underline",{title:"simple.underline_desc",cmd:"Underline"}));
p.add(m.createButton("strikethrough",{title:"simple.striketrough_desc",cmd:"Strikethrough"}));
p.add(m.createSeparator());
p.add(m.createButton("undo",{title:"simple.undo_desc",cmd:"Undo"}));
p.add(m.createButton("redo",{title:"simple.redo_desc",cmd:"Redo"}));
p.add(m.createSeparator());
p.add(m.createButton("cleanup",{title:"simple.cleanup_desc",cmd:"mceCleanup"}));
p.add(m.createSeparator());
p.add(m.createButton("insertunorderedlist",{title:"simple.bullist_desc",cmd:"InsertUnorderedList"}));
p.add(m.createButton("insertorderedlist",{title:"simple.numlist_desc",cmd:"InsertOrderedList"}));
p.renderTo(j);
return{iframeContainer:a,editorContainer:o.id+"_container",sizeContainer:l,deltaHeight:-20}
},getInfo:function(){return{longname:"Simple theme",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",version:tinymce.majorVersion+"."+tinymce.minorVersion}
}});
tinymce.ThemeManager.add("simple",tinymce.themes.SimpleTheme)
})();