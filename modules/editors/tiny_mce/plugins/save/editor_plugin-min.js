(function(){tinymce.create("tinymce.plugins.Save",{init:function(e,d){var f=this;
f.editor=e;
e.addCommand("mceSave",f._save,f);
e.addCommand("mceCancel",f._cancel,f);
e.addButton("save",{title:"save.save_desc",cmd:"mceSave"});
e.addButton("cancel",{title:"save.cancel_desc",cmd:"mceCancel"});
e.onNodeChange.add(f._nodeChange,f);
e.addShortcut("ctrl+s",e.getLang("save.save_desc"),"mceSave")
},getInfo:function(){return{longname:"Save",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/save",version:tinymce.majorVersion+"."+tinymce.minorVersion}
},_nodeChange:function(d,e,f){var d=this.editor;
if(d.getParam("save_enablewhendirty")){e.setDisabled("save",!d.isDirty());
e.setDisabled("cancel",!d.isDirty())
}},_save:function(){var j=this.editor,g,h,i,f;
g=tinymce.DOM.get(j.id).form||tinymce.DOM.getParent(j.id,"form");
if(j.getParam("save_enablewhendirty")&&!j.isDirty()){return
}tinyMCE.triggerSave();
if(h=j.getParam("save_onsavecallback")){if(j.execCallback("save_onsavecallback",j)){j.startContent=tinymce.trim(j.getContent({format:"raw"}));
j.nodeChanged()
}return
}if(g){j.isNotDirty=true;
if(g.onsubmit==null||g.onsubmit()!=false){g.submit()
}j.nodeChanged()
}else{j.windowManager.alert("Error: No form element found.")
}},_cancel:function(){var e=this.editor,f,d=tinymce.trim(e.startContent);
if(f=e.getParam("save_oncancelcallback")){e.execCallback("save_oncancelcallback",e);
return
}e.setContent(d);
e.undoManager.clear();
e.nodeChanged()
}});
tinymce.PluginManager.add("save",tinymce.plugins.Save)
})();