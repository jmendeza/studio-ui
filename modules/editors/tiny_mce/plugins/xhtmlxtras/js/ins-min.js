function init(){SXE.initElementDialog("ins");
if(SXE.currentAction=="update"){setFormValue("datetime",tinyMCEPopup.editor.dom.getAttrib(SXE.updateElement,"datetime"));
setFormValue("cite",tinyMCEPopup.editor.dom.getAttrib(SXE.updateElement,"cite"));
SXE.showRemoveButton()
}}function setElementAttribs(a){setAllCommonAttribs(a);
setAttrib(a,"datetime");
setAttrib(a,"cite");
a.removeAttribute("data-mce-new")
}function insertIns(){var d=tinyMCEPopup.editor.dom.getParent(SXE.focusElement,"INS");
if(d==null){var c=SXE.inst.selection.getContent();
if(c.length>0){insertInlineElement("ins");
var a=SXE.inst.dom.select("ins[data-mce-new]");
for(var b=0;
b<a.length;
b++){var d=a[b];
setElementAttribs(d)
}}}else{setElementAttribs(d)
}tinyMCEPopup.editor.nodeChanged();
tinyMCEPopup.execCommand("mceEndUndoLevel");
tinyMCEPopup.close()
}function removeIns(){SXE.removeElement("ins");
tinyMCEPopup.close()
}tinyMCEPopup.onInit.add(init);