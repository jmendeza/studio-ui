tinyMCEPopup.requireLangPack();
var templates={"window.open":"window.open('${url}','${target}','${options}')"};
function preinit(){var a;
if(a=tinyMCEPopup.getParam("external_link_list_url")){document.write('<script language="javascript" type="text/javascript" src="'+tinyMCEPopup.editor.documentBaseURI.toAbsolute(a)+'"><\/script>')
}}function changeClass(){var a=document.forms[0];
a.classes.value=getSelectValue(a,"classlist")
}function init(){tinyMCEPopup.resizeToInnerSize();
var f=document.forms[0];
var d=tinyMCEPopup.editor;
var g=d.selection.getNode();
var c="insert";
var e;
document.getElementById("hrefbrowsercontainer").innerHTML=getBrowserHTML("hrefbrowser","href","file","advlink");
document.getElementById("popupurlbrowsercontainer").innerHTML=getBrowserHTML("popupurlbrowser","popupurl","file","advlink");
document.getElementById("targetlistcontainer").innerHTML=getTargetListHTML("targetlist","target");
e=getLinkListHTML("linklisthref","href");
if(e==""){document.getElementById("linklisthrefrow").style.display="none"
}else{document.getElementById("linklisthrefcontainer").innerHTML=e
}e=getAnchorListHTML("anchorlist","href");
if(e==""){document.getElementById("anchorlistrow").style.display="none"
}else{document.getElementById("anchorlistcontainer").innerHTML=e
}if(isVisible("hrefbrowser")){document.getElementById("href").style.width="260px"
}if(isVisible("popupurlbrowser")){document.getElementById("popupurl").style.width="180px"
}g=d.dom.getParent(g,"A");
if(g==null){var a=d.dom.create("p",null,d.selection.getContent());
if(a.childNodes.length===1){g=a.firstChild
}}if(g!=null&&g.nodeName=="A"){c="update"
}f.insert.value=tinyMCEPopup.getLang(c,"Insert",true);
setPopupControlsDisabled(true);
if(c=="update"){var b=d.dom.getAttrib(g,"href");
var i=d.dom.getAttrib(g,"onclick");
var h=d.dom.getAttrib(g,"target")?d.dom.getAttrib(g,"target"):"_self";
setFormValue("href",b);
setFormValue("title",d.dom.getAttrib(g,"title"));
setFormValue("id",d.dom.getAttrib(g,"id"));
setFormValue("style",d.dom.getAttrib(g,"style"));
setFormValue("rel",d.dom.getAttrib(g,"rel"));
setFormValue("rev",d.dom.getAttrib(g,"rev"));
setFormValue("charset",d.dom.getAttrib(g,"charset"));
setFormValue("hreflang",d.dom.getAttrib(g,"hreflang"));
setFormValue("dir",d.dom.getAttrib(g,"dir"));
setFormValue("lang",d.dom.getAttrib(g,"lang"));
setFormValue("tabindex",d.dom.getAttrib(g,"tabindex",typeof(g.tabindex)!="undefined"?g.tabindex:""));
setFormValue("accesskey",d.dom.getAttrib(g,"accesskey",typeof(g.accesskey)!="undefined"?g.accesskey:""));
setFormValue("type",d.dom.getAttrib(g,"type"));
setFormValue("onfocus",d.dom.getAttrib(g,"onfocus"));
setFormValue("onblur",d.dom.getAttrib(g,"onblur"));
setFormValue("onclick",i);
setFormValue("ondblclick",d.dom.getAttrib(g,"ondblclick"));
setFormValue("onmousedown",d.dom.getAttrib(g,"onmousedown"));
setFormValue("onmouseup",d.dom.getAttrib(g,"onmouseup"));
setFormValue("onmouseover",d.dom.getAttrib(g,"onmouseover"));
setFormValue("onmousemove",d.dom.getAttrib(g,"onmousemove"));
setFormValue("onmouseout",d.dom.getAttrib(g,"onmouseout"));
setFormValue("onkeypress",d.dom.getAttrib(g,"onkeypress"));
setFormValue("onkeydown",d.dom.getAttrib(g,"onkeydown"));
setFormValue("onkeyup",d.dom.getAttrib(g,"onkeyup"));
setFormValue("target",h);
setFormValue("classes",d.dom.getAttrib(g,"class"));
if(i!=null&&i.indexOf("window.open")!=-1){parseWindowOpen(i)
}else{parseFunction(i)
}selectByValue(f,"dir",d.dom.getAttrib(g,"dir"));
selectByValue(f,"rel",d.dom.getAttrib(g,"rel"));
selectByValue(f,"rev",d.dom.getAttrib(g,"rev"));
selectByValue(f,"linklisthref",b);
if(b.charAt(0)=="#"){selectByValue(f,"anchorlist",b)
}addClassesToList("classlist","advlink_styles");
selectByValue(f,"classlist",d.dom.getAttrib(g,"class"),true);
selectByValue(f,"targetlist",h,true)
}else{addClassesToList("classlist","advlink_styles")
}}function checkPrefix(a){if(a.value&&Validator.isEmail(a)&&!/^\s*mailto:/i.test(a.value)&&confirm(tinyMCEPopup.getLang("advlink_dlg.is_email"))){a.value="mailto:"+a.value
}if(/^\s*www\./i.test(a.value)&&confirm(tinyMCEPopup.getLang("advlink_dlg.is_external"))){a.value="http://"+a.value
}}function setFormValue(a,b){document.forms[0].elements[a].value=b
}function parseWindowOpen(c){var a=document.forms[0];
if(c.indexOf("return false;")!=-1){a.popupreturn.checked=true;
c=c.replace("return false;","")
}else{a.popupreturn.checked=false
}var e=parseLink(c);
if(e!=null){a.ispopup.checked=true;
setPopupControlsDisabled(false);
var d=parseOptions(e.options);
var b=e.url;
a.popupname.value=e.target;
a.popupurl.value=b;
a.popupwidth.value=getOption(d,"width");
a.popupheight.value=getOption(d,"height");
a.popupleft.value=getOption(d,"left");
a.popuptop.value=getOption(d,"top");
if(a.popupleft.value.indexOf("screen")!=-1){a.popupleft.value="c"
}if(a.popuptop.value.indexOf("screen")!=-1){a.popuptop.value="c"
}a.popuplocation.checked=getOption(d,"location")=="yes";
a.popupscrollbars.checked=getOption(d,"scrollbars")=="yes";
a.popupmenubar.checked=getOption(d,"menubar")=="yes";
a.popupresizable.checked=getOption(d,"resizable")=="yes";
a.popuptoolbar.checked=getOption(d,"toolbar")=="yes";
a.popupstatus.checked=getOption(d,"status")=="yes";
a.popupdependent.checked=getOption(d,"dependent")=="yes";
buildOnClick()
}}function parseFunction(b){var a=document.forms[0];
var c=parseLink(b)
}function getOption(b,a){return typeof(b[a])=="undefined"?"":b[a]
}function setPopupControlsDisabled(b){var a=document.forms[0];
a.popupname.disabled=b;
a.popupurl.disabled=b;
a.popupwidth.disabled=b;
a.popupheight.disabled=b;
a.popupleft.disabled=b;
a.popuptop.disabled=b;
a.popuplocation.disabled=b;
a.popupscrollbars.disabled=b;
a.popupmenubar.disabled=b;
a.popupresizable.disabled=b;
a.popuptoolbar.disabled=b;
a.popupstatus.disabled=b;
a.popupreturn.disabled=b;
a.popupdependent.disabled=b;
setBrowserDisabled("popupurlbrowser",b)
}function parseLink(f){f=f.replace(new RegExp("&#39;","g"),"'");
var a=f.replace(new RegExp("\\s*([A-Za-z0-9.]*)\\s*\\(.*","gi"),"$1");
var h=templates[a];
if(h){var g=h.match(new RegExp("'?\\$\\{[A-Za-z0-9.]*\\}'?","gi"));
var e="\\s*[A-Za-z0-9.]*\\s*\\(";
var d="";
for(var c=0;
c<g.length;
c++){if(g[c].indexOf("'${")!=-1){e+="'(.*)'"
}else{e+="([0-9]*)"
}d+="$"+(c+1);
g[c]=g[c].replace(new RegExp("[^A-Za-z0-9]","gi"),"");
if(c!=g.length-1){e+="\\s*,\\s*";
d+="<delim>"
}else{e+=".*"
}}e+="\\);?";
var j=[];
j._function=a;
var b=f.replace(new RegExp(e,"gi"),d).split("<delim>");
for(var c=0;
c<g.length;
c++){j[g[c]]=b[c]
}return j
}return null
}function parseOptions(c){if(c==null||c==""){return[]
}c=c.toLowerCase();
c=c.replace(/;/g,",");
c=c.replace(/[^0-9a-z=,]/g,"");
var e=c.split(",");
var a=[];
for(var b=0;
b<e.length;
b++){var d=e[b].split("=");
if(d.length==2){a[d[0]]=d[1]
}}return a
}function buildOnClick(){var a=document.forms[0];
if(!a.ispopup.checked){a.onclick.value="";
return
}var c="window.open('";
var b=a.popupurl.value;
c+=b+"','";
c+=a.popupname.value+"','";
if(a.popuplocation.checked){c+="location=yes,"
}if(a.popupscrollbars.checked){c+="scrollbars=yes,"
}if(a.popupmenubar.checked){c+="menubar=yes,"
}if(a.popupresizable.checked){c+="resizable=yes,"
}if(a.popuptoolbar.checked){c+="toolbar=yes,"
}if(a.popupstatus.checked){c+="status=yes,"
}if(a.popupdependent.checked){c+="dependent=yes,"
}if(a.popupwidth.value!=""){c+="width="+a.popupwidth.value+","
}if(a.popupheight.value!=""){c+="height="+a.popupheight.value+","
}if(a.popupleft.value!=""){if(a.popupleft.value!="c"){c+="left="+a.popupleft.value+","
}else{c+="left='+(screen.availWidth/2-"+(a.popupwidth.value/2)+")+',"
}}if(a.popuptop.value!=""){if(a.popuptop.value!="c"){c+="top="+a.popuptop.value+","
}else{c+="top='+(screen.availHeight/2-"+(a.popupheight.value/2)+")+',"
}}if(c.charAt(c.length-1)==","){c=c.substring(0,c.length-1)
}c+="');";
if(a.popupreturn.checked){c+="return false;"
}a.onclick.value=c;
if(a.href.value==""){a.href.value=b
}}function setAttrib(f,d,c){var b=document.forms[0];
var a=b.elements[d.toLowerCase()];
var e=tinyMCEPopup.editor.dom;
if(typeof(c)=="undefined"||c==null){c="";
if(a){c=a.value
}}if(d=="style"){c=e.serializeStyle(e.parseStyle(c),"a")
}e.setAttrib(f,d,c)
}function getAnchorListHTML(h,g){var c=tinyMCEPopup.editor,b=c.dom.select("a"),d,f,a,e="";
for(f=0,a=b.length;
f<a;
f++){if((d=c.dom.getAttrib(b[f],"name"))!=""){e+='<option value="#'+d+'">'+d+"</option>"
}if((d=b[f].id)!=""&&!b[f].href){e+='<option value="#'+d+'">'+d+"</option>"
}}if(e==""){return""
}e='<select id="'+h+'" name="'+h+'" class="mceAnchorList" onchange="this.form.'+g+'.value=this.options[this.selectedIndex].value"><option value="">---</option>'+e+"</select>";
return e
}function insertAction(){var c=tinyMCEPopup.editor;
var d,a,b;
d=c.selection.getNode();
checkPrefix(document.forms[0].href);
d=c.dom.getParent(d,"A");
if(!document.forms[0].href.value){b=c.selection.getBookmark();
c.dom.remove(d,1);
c.selection.moveToBookmark(b);
tinyMCEPopup.execCommand("mceEndUndoLevel");
tinyMCEPopup.close();
return
}if(d==null){c.getDoc().execCommand("unlink",false,null);
tinyMCEPopup.execCommand("mceInsertLink",false,"#mce_temp_url#",{skip_undo:1});
a=tinymce.grep(c.dom.select("a"),function(e){return c.dom.getAttrib(e,"href")=="#mce_temp_url#"
});
for(b=0;
b<a.length;
b++){setAllAttribs(d=a[b])
}}else{setAllAttribs(d)
}if(d.childNodes.length!=1||d.firstChild.nodeName!="IMG"){c.focus();
c.selection.select(d);
c.selection.collapse(0);
tinyMCEPopup.storeSelection()
}tinyMCEPopup.execCommand("mceEndUndoLevel");
tinyMCEPopup.close()
}function setAllAttribs(d){var a=document.forms[0];
var b=a.href.value.replace(/ /g,"%20");
var c=getSelectValue(a,"targetlist");
setAttrib(d,"href",b);
setAttrib(d,"title");
setAttrib(d,"target",c=="_self"?"":c);
setAttrib(d,"id");
setAttrib(d,"style");
setAttrib(d,"class",getSelectValue(a,"classlist"));
setAttrib(d,"rel");
setAttrib(d,"rev");
setAttrib(d,"charset");
setAttrib(d,"hreflang");
setAttrib(d,"dir");
setAttrib(d,"lang");
setAttrib(d,"tabindex");
setAttrib(d,"accesskey");
setAttrib(d,"type");
setAttrib(d,"onfocus");
setAttrib(d,"onblur");
setAttrib(d,"onclick");
setAttrib(d,"ondblclick");
setAttrib(d,"onmousedown");
setAttrib(d,"onmouseup");
setAttrib(d,"onmouseover");
setAttrib(d,"onmousemove");
setAttrib(d,"onmouseout");
setAttrib(d,"onkeypress");
setAttrib(d,"onkeydown");
setAttrib(d,"onkeyup");
if(tinyMCE.isMSIE5){d.outerHTML=d.outerHTML
}}function getSelectValue(a,b){var c=a.elements[b];
if(!c||c.options==null||c.selectedIndex==-1){return""
}return c.options[c.selectedIndex].value
}function getLinkListHTML(d,c,e){if(typeof(tinyMCELinkList)=="undefined"||tinyMCELinkList.length==0){return""
}var b="";
b+='<select id="'+d+'" name="'+d+'"';
b+=' class="mceLinkList" onchange="this.form.'+c+".value=";
b+="this.options[this.selectedIndex].value;";
if(typeof(e)!="undefined"){b+=e+"('"+c+"',this.options[this.selectedIndex].text,this.options[this.selectedIndex].value);"
}b+='"><option value="">---</option>';
for(var a=0;
a<tinyMCELinkList.length;
a++){b+='<option value="'+tinyMCELinkList[a][1]+'">'+tinyMCELinkList[a][0]+"</option>"
}b+="</select>";
return b
}function getTargetListHTML(f,e){var a=tinyMCEPopup.getParam("theme_advanced_link_targets","").split(";");
var d="";
d+='<select id="'+f+'" name="'+f+'" onchange="this.form.'+e+".value=";
d+='this.options[this.selectedIndex].value;">';
d+='<option value="_self">'+tinyMCEPopup.getLang("advlink_dlg.target_same")+"</option>";
d+='<option value="_blank">'+tinyMCEPopup.getLang("advlink_dlg.target_blank")+" (_blank)</option>";
d+='<option value="_parent">'+tinyMCEPopup.getLang("advlink_dlg.target_parent")+" (_parent)</option>";
d+='<option value="_top">'+tinyMCEPopup.getLang("advlink_dlg.target_top")+" (_top)</option>";
for(var c=0;
c<a.length;
c++){var b,g;
if(a[c]==""){continue
}b=a[c].split("=")[0];
g=a[c].split("=")[1];
d+='<option value="'+b+'">'+g+" ("+b+")</option>"
}d+="</select>";
return d
}preinit();
tinyMCEPopup.onInit.add(init);