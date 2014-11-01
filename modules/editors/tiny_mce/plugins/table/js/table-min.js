tinyMCEPopup.requireLangPack();
var action,orgTableWidth,orgTableHeight,dom=tinyMCEPopup.editor.dom;
function insertTable(){var h=document.forms[0];
var d=tinyMCEPopup.editor,t=d.dom;
var l=2,j=2,r=0,u=-1,a=-1,s,p,o,c,v,n,k;
var m="",q,e;
var w,z,b;
tinyMCEPopup.restoreSelection();
if(!AutoValidator.validate(h)){tinyMCEPopup.alert(AutoValidator.getErrorMessages(h).join(". ")+".");
return false
}e=t.getParent(d.selection.getNode(),"table");
l=h.elements.cols.value;
j=h.elements.rows.value;
r=h.elements.border.value!=""?h.elements.border.value:0;
u=h.elements.cellpadding.value!=""?h.elements.cellpadding.value:"";
a=h.elements.cellspacing.value!=""?h.elements.cellspacing.value:"";
s=getSelectValue(h,"align");
n=getSelectValue(h,"tframe");
k=getSelectValue(h,"rules");
p=h.elements.width.value;
o=h.elements.height.value;
bordercolor=h.elements.bordercolor.value;
bgcolor=h.elements.bgcolor.value;
c=getSelectValue(h,"class");
id=h.elements.id.value;
summary=h.elements.summary.value;
style=h.elements.style.value;
dir=h.elements.dir.value;
lang=h.elements.lang.value;
background=h.elements.backgroundimage.value;
v=h.elements.caption.checked;
w=tinyMCEPopup.getParam("table_cell_limit",false);
z=tinyMCEPopup.getParam("table_row_limit",false);
b=tinyMCEPopup.getParam("table_col_limit",false);
if(b&&l>b){tinyMCEPopup.alert(d.getLang("table_dlg.col_limit").replace(/\{\$cols\}/g,b));
return false
}else{if(z&&j>z){tinyMCEPopup.alert(d.getLang("table_dlg.row_limit").replace(/\{\$rows\}/g,z));
return false
}else{if(w&&l*j>w){tinyMCEPopup.alert(d.getLang("table_dlg.cell_limit").replace(/\{\$cells\}/g,w));
return false
}}}if(action=="update"){t.setAttrib(e,"cellPadding",u,true);
t.setAttrib(e,"cellSpacing",a,true);
if(!isCssSize(r)){t.setAttrib(e,"border",r)
}else{t.setAttrib(e,"border","")
}if(r==""){t.setStyle(e,"border-width","");
t.setStyle(e,"border","");
t.setAttrib(e,"border","")
}t.setAttrib(e,"align",s);
t.setAttrib(e,"frame",n);
t.setAttrib(e,"rules",k);
t.setAttrib(e,"class",c);
t.setAttrib(e,"style",style);
t.setAttrib(e,"id",id);
t.setAttrib(e,"summary",summary);
t.setAttrib(e,"dir",dir);
t.setAttrib(e,"lang",lang);
q=d.dom.select("caption",e)[0];
if(q&&!v){q.parentNode.removeChild(q)
}if(!q&&v){q=e.ownerDocument.createElement("caption");
if(!tinymce.isIE||tinymce.isIE11){q.innerHTML='<br data-mce-bogus="1"/>'
}e.insertBefore(q,e.firstChild)
}if(p&&d.settings.inline_styles){t.setStyle(e,"width",p);
t.setAttrib(e,"width","")
}else{t.setAttrib(e,"width",p,true);
t.setStyle(e,"width","")
}t.setAttrib(e,"borderColor","");
t.setAttrib(e,"bgColor","");
t.setAttrib(e,"background","");
if(o&&d.settings.inline_styles){t.setStyle(e,"height",o);
t.setAttrib(e,"height","")
}else{t.setAttrib(e,"height",o,true);
t.setStyle(e,"height","")
}if(background!=""){e.style.backgroundImage="url('"+background+"')"
}else{e.style.backgroundImage=""
}if(bordercolor!=""){e.style.borderColor=bordercolor;
e.style.borderStyle=e.style.borderStyle==""?"solid":e.style.borderStyle;
e.style.borderWidth=cssSize(r)
}else{e.style.borderColor=""
}e.style.backgroundColor=bgcolor;
e.style.height=getCSSSize(o);
d.addVisual();
d.nodeChanged();
d.execCommand("mceEndUndoLevel",false,{},{skip_undo:true});
if(h.width.value!=orgTableWidth||h.height.value!=orgTableHeight){d.execCommand("mceRepaint")
}tinyMCEPopup.close();
return true
}m+="<table";
m+=makeAttrib("id",id);
if(!isCssSize(r)){m+=makeAttrib("border",r)
}m+=makeAttrib("cellpadding",u);
m+=makeAttrib("cellspacing",a);
m+=makeAttrib("data-mce-new","1");
if(p&&d.settings.inline_styles){if(style){style+="; "
}if(/^[0-9\.]+$/.test(p)){p+="px"
}style+="width: "+p
}else{m+=makeAttrib("width",p)
}m+=makeAttrib("align",s);
m+=makeAttrib("frame",n);
m+=makeAttrib("rules",k);
m+=makeAttrib("class",c);
m+=makeAttrib("style",style);
m+=makeAttrib("summary",summary);
m+=makeAttrib("dir",dir);
m+=makeAttrib("lang",lang);
m+=">";
if(v){if(!tinymce.isIE||tinymce.isIE11){m+='<caption><br data-mce-bogus="1"/></caption>'
}else{m+="<caption></caption>"
}}for(var g=0;
g<j;
g++){m+="<tr>";
for(var i=0;
i<l;
i++){if(!tinymce.isIE||tinymce.isIE11){m+='<td><br data-mce-bogus="1"/></td>'
}else{m+="<td></td>"
}}m+="</tr>"
}m+="</table>";
if(d.settings.fix_table_elements){var f="";
d.focus();
d.selection.setContent('<br class="_mce_marker" />');
tinymce.each("h1,h2,h3,h4,h5,h6,p".split(","),function(x){if(f){f+=","
}f+=x+" ._mce_marker"
});
tinymce.each(d.dom.select(f),function(x){d.dom.split(d.dom.getParent(x,"h1,h2,h3,h4,h5,h6,p"),x)
});
t.setOuterHTML(t.select("br._mce_marker")[0],m)
}else{d.execCommand("mceInsertContent",false,m)
}tinymce.each(t.select("table[data-mce-new]"),function(A){var x=t.select("td,th",A);
if(tinymce.isIE&&!tinymce.isIE11&&A.nextSibling==null){if(d.settings.forced_root_block){t.insertAfter(t.create(d.settings.forced_root_block),A)
}else{t.insertAfter(t.create("br",{"data-mce-bogus":"1"}),A)
}}try{d.selection.setCursorLocation(x[0],0)
}catch(y){}t.setAttrib(A,"data-mce-new","")
});
d.addVisual();
d.execCommand("mceEndUndoLevel",false,{},{skip_undo:true});
tinyMCEPopup.close()
}function makeAttrib(d,c){var b=document.forms[0];
var a=b.elements[d];
if(typeof(c)=="undefined"||c==null){c="";
if(a){c=a.value
}}if(c==""){return""
}c=c.replace(/&/g,"&amp;");
c=c.replace(/\"/g,"&quot;");
c=c.replace(/</g,"&lt;");
c=c.replace(/>/g,"&gt;");
return" "+d+'="'+c+'"'
}function init(){tinyMCEPopup.resizeToInnerSize();
document.getElementById("backgroundimagebrowsercontainer").innerHTML=getBrowserHTML("backgroundimagebrowser","backgroundimage","image","table");
document.getElementById("backgroundimagebrowsercontainer").innerHTML=getBrowserHTML("backgroundimagebrowser","backgroundimage","image","table");
document.getElementById("bordercolor_pickcontainer").innerHTML=getColorPickerHTML("bordercolor_pick","bordercolor");
document.getElementById("bgcolor_pickcontainer").innerHTML=getColorPickerHTML("bgcolor_pick","bgcolor");
var k=2,j=2,r=tinyMCEPopup.getParam("table_default_border","0"),y=tinyMCEPopup.getParam("table_default_cellpadding",""),b=tinyMCEPopup.getParam("table_default_cellspacing","");
var s="",q="",n="",v="",a="",c="";
var o="",f="",w="",p="",z="",x="",a="",v="",h="",m="";
var d=tinyMCEPopup.editor,u=d.dom;
var g=document.forms[0];
var e=u.getParent(d.selection.getNode(),"table");
tinymce.each("summary id rules dir style frame".split(" "),function(i){var A=tinyMCEPopup.dom.getParent(i,"tr")||tinyMCEPopup.dom.getParent("t"+i,"tr");
if(A&&!tinyMCEPopup.editor.schema.isValid("table",i)){A.style.display="none"
}});
action=tinyMCEPopup.getWindowArg("action");
if(!action){action=e?"update":"insert"
}if(e&&action!="insert"){var l=e.rows;
var k=0;
for(var t=0;
t<l.length;
t++){if(l[t].cells.length>k){k=l[t].cells.length
}}k=k;
j=l.length;
st=u.parseStyle(u.getAttrib(e,"style"));
r=trimSize(getStyle(e,"border","borderWidth"));
y=u.getAttrib(e,"cellpadding","");
b=u.getAttrib(e,"cellspacing","");
q=trimSize(getStyle(e,"width","width"));
n=trimSize(getStyle(e,"height","height"));
v=convertRGBToHex(getStyle(e,"bordercolor","borderLeftColor"));
a=convertRGBToHex(getStyle(e,"bgcolor","backgroundColor"));
s=u.getAttrib(e,"align",s);
m=u.getAttrib(e,"frame");
h=u.getAttrib(e,"rules");
c=tinymce.trim(u.getAttrib(e,"class").replace(/mceItem.+/g,""));
o=u.getAttrib(e,"id");
f=u.getAttrib(e,"summary");
w=u.serializeStyle(st);
p=u.getAttrib(e,"dir");
z=u.getAttrib(e,"lang");
x=getStyle(e,"background","backgroundImage").replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)","gi"),"$1");
g.caption.checked=e.getElementsByTagName("caption").length>0;
orgTableWidth=q;
orgTableHeight=n;
action="update";
g.insert.value=d.getLang("update")
}addClassesToList("class","table_styles");
TinyMCE_EditableSelects.init();
selectByValue(g,"align",s);
selectByValue(g,"tframe",m);
selectByValue(g,"rules",h);
selectByValue(g,"class",c,true,true);
g.cols.value=k;
g.rows.value=j;
g.border.value=r;
g.cellpadding.value=y;
g.cellspacing.value=b;
g.width.value=q;
g.height.value=n;
g.bordercolor.value=v;
g.bgcolor.value=a;
g.id.value=o;
g.summary.value=f;
g.style.value=w;
g.dir.value=p;
g.lang.value=z;
g.backgroundimage.value=x;
updateColor("bordercolor_pick","bordercolor");
updateColor("bgcolor_pick","bgcolor");
if(isVisible("backgroundimagebrowser")){document.getElementById("backgroundimage").style.width="180px"
}if(action=="update"){g.cols.disabled=true;
g.rows.disabled=true
}}function changedSize(){var b=document.forms[0];
var c=dom.parseStyle(b.style.value);
var a=b.height.value;
if(a!=""){c.height=getCSSSize(a)
}else{c.height=""
}b.style.value=dom.serializeStyle(c)
}function isCssSize(a){return/^[0-9.]+(%|in|cm|mm|em|ex|pt|pc|px)$/.test(a)
}function cssSize(b,a){b=tinymce.trim(b||a);
if(!isCssSize(b)){return parseInt(b,10)+"px"
}return b
}function changedBackgroundImage(){var a=document.forms[0];
var b=dom.parseStyle(a.style.value);
b["background-image"]="url('"+a.backgroundimage.value+"')";
a.style.value=dom.serializeStyle(b)
}function changedBorder(){var a=document.forms[0];
var b=dom.parseStyle(a.style.value);
if(a.border.value!=""&&(isCssSize(a.border.value)||a.bordercolor.value!="")){b["border-width"]=cssSize(a.border.value)
}else{if(!a.border.value){b.border="";
b["border-width"]=""
}}a.style.value=dom.serializeStyle(b)
}function changedColor(){var a=document.forms[0];
var b=dom.parseStyle(a.style.value);
b["background-color"]=a.bgcolor.value;
if(a.bordercolor.value!=""){b["border-color"]=a.bordercolor.value;
if(!b["border-width"]){b["border-width"]=cssSize(a.border.value,1)
}}a.style.value=dom.serializeStyle(b)
}function changedStyle(){var a=document.forms[0];
var b=dom.parseStyle(a.style.value);
if(b["background-image"]){a.backgroundimage.value=b["background-image"].replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)","gi"),"$1")
}else{a.backgroundimage.value=""
}if(b.width){a.width.value=trimSize(b.width)
}if(b.height){a.height.value=trimSize(b.height)
}if(b["background-color"]){a.bgcolor.value=b["background-color"];
updateColor("bgcolor_pick","bgcolor")
}if(b["border-color"]){a.bordercolor.value=b["border-color"];
updateColor("bordercolor_pick","bordercolor")
}}tinyMCEPopup.onInit.add(init);