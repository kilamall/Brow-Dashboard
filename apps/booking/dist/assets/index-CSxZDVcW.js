function KC(t,e){for(var n=0;n<e.length;n++){const r=e[n];if(typeof r!="string"&&!Array.isArray(r)){for(const i in r)if(i!=="default"&&!(i in t)){const s=Object.getOwnPropertyDescriptor(r,i);s&&Object.defineProperty(t,i,s.get?s:{enumerable:!0,get:()=>r[i]})}}}return Object.freeze(Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}))}(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();function QC(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var UE={exports:{}},$c={},$E={exports:{}},ne={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Za=Symbol.for("react.element"),YC=Symbol.for("react.portal"),JC=Symbol.for("react.fragment"),XC=Symbol.for("react.strict_mode"),ZC=Symbol.for("react.profiler"),eP=Symbol.for("react.provider"),tP=Symbol.for("react.context"),nP=Symbol.for("react.forward_ref"),rP=Symbol.for("react.suspense"),iP=Symbol.for("react.memo"),sP=Symbol.for("react.lazy"),Jy=Symbol.iterator;function oP(t){return t===null||typeof t!="object"?null:(t=Jy&&t[Jy]||t["@@iterator"],typeof t=="function"?t:null)}var jE={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},BE=Object.assign,zE={};function Js(t,e,n){this.props=t,this.context=e,this.refs=zE,this.updater=n||jE}Js.prototype.isReactComponent={};Js.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Js.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function HE(){}HE.prototype=Js.prototype;function $p(t,e,n){this.props=t,this.context=e,this.refs=zE,this.updater=n||jE}var jp=$p.prototype=new HE;jp.constructor=$p;BE(jp,Js.prototype);jp.isPureReactComponent=!0;var Xy=Array.isArray,WE=Object.prototype.hasOwnProperty,Bp={current:null},qE={key:!0,ref:!0,__self:!0,__source:!0};function GE(t,e,n){var r,i={},s=null,o=null;if(e!=null)for(r in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)WE.call(e,r)&&!qE.hasOwnProperty(r)&&(i[r]=e[r]);var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){for(var u=Array(l),c=0;c<l;c++)u[c]=arguments[c+2];i.children=u}if(t&&t.defaultProps)for(r in l=t.defaultProps,l)i[r]===void 0&&(i[r]=l[r]);return{$$typeof:Za,type:t,key:s,ref:o,props:i,_owner:Bp.current}}function aP(t,e){return{$$typeof:Za,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function zp(t){return typeof t=="object"&&t!==null&&t.$$typeof===Za}function lP(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var Zy=/\/+/g;function sd(t,e){return typeof t=="object"&&t!==null&&t.key!=null?lP(""+t.key):e.toString(36)}function du(t,e,n,r,i){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var o=!1;if(t===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(t.$$typeof){case Za:case YC:o=!0}}if(o)return o=t,i=i(o),t=r===""?"."+sd(o,0):r,Xy(i)?(n="",t!=null&&(n=t.replace(Zy,"$&/")+"/"),du(i,e,n,"",function(c){return c})):i!=null&&(zp(i)&&(i=aP(i,n+(!i.key||o&&o.key===i.key?"":(""+i.key).replace(Zy,"$&/")+"/")+t)),e.push(i)),1;if(o=0,r=r===""?".":r+":",Xy(t))for(var l=0;l<t.length;l++){s=t[l];var u=r+sd(s,l);o+=du(s,e,n,u,i)}else if(u=oP(t),typeof u=="function")for(t=u.call(t),l=0;!(s=t.next()).done;)s=s.value,u=r+sd(s,l++),o+=du(s,e,n,u,i);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function $l(t,e,n){if(t==null)return t;var r=[],i=0;return du(t,r,"","",function(s){return e.call(n,s,i++)}),r}function uP(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var gt={current:null},fu={transition:null},cP={ReactCurrentDispatcher:gt,ReactCurrentBatchConfig:fu,ReactCurrentOwner:Bp};function KE(){throw Error("act(...) is not supported in production builds of React.")}ne.Children={map:$l,forEach:function(t,e,n){$l(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return $l(t,function(){e++}),e},toArray:function(t){return $l(t,function(e){return e})||[]},only:function(t){if(!zp(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};ne.Component=Js;ne.Fragment=JC;ne.Profiler=ZC;ne.PureComponent=$p;ne.StrictMode=XC;ne.Suspense=rP;ne.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=cP;ne.act=KE;ne.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var r=BE({},t.props),i=t.key,s=t.ref,o=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=Bp.current),e.key!==void 0&&(i=""+e.key),t.type&&t.type.defaultProps)var l=t.type.defaultProps;for(u in e)WE.call(e,u)&&!qE.hasOwnProperty(u)&&(r[u]=e[u]===void 0&&l!==void 0?l[u]:e[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){l=Array(u);for(var c=0;c<u;c++)l[c]=arguments[c+2];r.children=l}return{$$typeof:Za,type:t.type,key:i,ref:s,props:r,_owner:o}};ne.createContext=function(t){return t={$$typeof:tP,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:eP,_context:t},t.Consumer=t};ne.createElement=GE;ne.createFactory=function(t){var e=GE.bind(null,t);return e.type=t,e};ne.createRef=function(){return{current:null}};ne.forwardRef=function(t){return{$$typeof:nP,render:t}};ne.isValidElement=zp;ne.lazy=function(t){return{$$typeof:sP,_payload:{_status:-1,_result:t},_init:uP}};ne.memo=function(t,e){return{$$typeof:iP,type:t,compare:e===void 0?null:e}};ne.startTransition=function(t){var e=fu.transition;fu.transition={};try{t()}finally{fu.transition=e}};ne.unstable_act=KE;ne.useCallback=function(t,e){return gt.current.useCallback(t,e)};ne.useContext=function(t){return gt.current.useContext(t)};ne.useDebugValue=function(){};ne.useDeferredValue=function(t){return gt.current.useDeferredValue(t)};ne.useEffect=function(t,e){return gt.current.useEffect(t,e)};ne.useId=function(){return gt.current.useId()};ne.useImperativeHandle=function(t,e,n){return gt.current.useImperativeHandle(t,e,n)};ne.useInsertionEffect=function(t,e){return gt.current.useInsertionEffect(t,e)};ne.useLayoutEffect=function(t,e){return gt.current.useLayoutEffect(t,e)};ne.useMemo=function(t,e){return gt.current.useMemo(t,e)};ne.useReducer=function(t,e,n){return gt.current.useReducer(t,e,n)};ne.useRef=function(t){return gt.current.useRef(t)};ne.useState=function(t){return gt.current.useState(t)};ne.useSyncExternalStore=function(t,e,n){return gt.current.useSyncExternalStore(t,e,n)};ne.useTransition=function(){return gt.current.useTransition()};ne.version="18.3.1";$E.exports=ne;var L=$E.exports;const QE=QC(L),hP=KC({__proto__:null,default:QE},[L]);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var dP=L,fP=Symbol.for("react.element"),pP=Symbol.for("react.fragment"),mP=Object.prototype.hasOwnProperty,gP=dP.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,yP={key:!0,ref:!0,__self:!0,__source:!0};function YE(t,e,n){var r,i={},s=null,o=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(r in e)mP.call(e,r)&&!yP.hasOwnProperty(r)&&(i[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)i[r]===void 0&&(i[r]=e[r]);return{$$typeof:fP,type:t,key:s,ref:o,props:i,_owner:gP.current}}$c.Fragment=pP;$c.jsx=YE;$c.jsxs=YE;UE.exports=$c;var D=UE.exports,of={},JE={exports:{}},Mt={},XE={exports:{}},ZE={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(B,Y){var J=B.length;B.push(Y);e:for(;0<J;){var ge=J-1>>>1,re=B[ge];if(0<i(re,Y))B[ge]=Y,B[J]=re,J=ge;else break e}}function n(B){return B.length===0?null:B[0]}function r(B){if(B.length===0)return null;var Y=B[0],J=B.pop();if(J!==Y){B[0]=J;e:for(var ge=0,re=B.length,Te=re>>>1;ge<Te;){var Pt=2*(ge+1)-1,Qt=B[Pt],Yt=Pt+1,Ft=B[Yt];if(0>i(Qt,J))Yt<re&&0>i(Ft,Qt)?(B[ge]=Ft,B[Yt]=J,ge=Yt):(B[ge]=Qt,B[Pt]=J,ge=Pt);else if(Yt<re&&0>i(Ft,J))B[ge]=Ft,B[Yt]=J,ge=Yt;else break e}}return Y}function i(B,Y){var J=B.sortIndex-Y.sortIndex;return J!==0?J:B.id-Y.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var o=Date,l=o.now();t.unstable_now=function(){return o.now()-l}}var u=[],c=[],d=1,p=null,m=3,w=!1,C=!1,P=!1,N=typeof setTimeout=="function"?setTimeout:null,I=typeof clearTimeout=="function"?clearTimeout:null,y=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function S(B){for(var Y=n(c);Y!==null;){if(Y.callback===null)r(c);else if(Y.startTime<=B)r(c),Y.sortIndex=Y.expirationTime,e(u,Y);else break;Y=n(c)}}function b(B){if(P=!1,S(B),!C)if(n(u)!==null)C=!0,Rn(F);else{var Y=n(c);Y!==null&&Vt(b,Y.startTime-B)}}function F(B,Y){C=!1,P&&(P=!1,I(v),v=-1),w=!0;var J=m;try{for(S(Y),p=n(u);p!==null&&(!(p.expirationTime>Y)||B&&!k());){var ge=p.callback;if(typeof ge=="function"){p.callback=null,m=p.priorityLevel;var re=ge(p.expirationTime<=Y);Y=t.unstable_now(),typeof re=="function"?p.callback=re:p===n(u)&&r(u),S(Y)}else r(u);p=n(u)}if(p!==null)var Te=!0;else{var Pt=n(c);Pt!==null&&Vt(b,Pt.startTime-Y),Te=!1}return Te}finally{p=null,m=J,w=!1}}var $=!1,_=null,v=-1,E=5,T=-1;function k(){return!(t.unstable_now()-T<E)}function R(){if(_!==null){var B=t.unstable_now();T=B;var Y=!0;try{Y=_(!0,B)}finally{Y?A():($=!1,_=null)}}else $=!1}var A;if(typeof y=="function")A=function(){y(R)};else if(typeof MessageChannel<"u"){var ct=new MessageChannel,kn=ct.port2;ct.port1.onmessage=R,A=function(){kn.postMessage(null)}}else A=function(){N(R,0)};function Rn(B){_=B,$||($=!0,A())}function Vt(B,Y){v=N(function(){B(t.unstable_now())},Y)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(B){B.callback=null},t.unstable_continueExecution=function(){C||w||(C=!0,Rn(F))},t.unstable_forceFrameRate=function(B){0>B||125<B?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):E=0<B?Math.floor(1e3/B):5},t.unstable_getCurrentPriorityLevel=function(){return m},t.unstable_getFirstCallbackNode=function(){return n(u)},t.unstable_next=function(B){switch(m){case 1:case 2:case 3:var Y=3;break;default:Y=m}var J=m;m=Y;try{return B()}finally{m=J}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(B,Y){switch(B){case 1:case 2:case 3:case 4:case 5:break;default:B=3}var J=m;m=B;try{return Y()}finally{m=J}},t.unstable_scheduleCallback=function(B,Y,J){var ge=t.unstable_now();switch(typeof J=="object"&&J!==null?(J=J.delay,J=typeof J=="number"&&0<J?ge+J:ge):J=ge,B){case 1:var re=-1;break;case 2:re=250;break;case 5:re=1073741823;break;case 4:re=1e4;break;default:re=5e3}return re=J+re,B={id:d++,callback:Y,priorityLevel:B,startTime:J,expirationTime:re,sortIndex:-1},J>ge?(B.sortIndex=J,e(c,B),n(u)===null&&B===n(c)&&(P?(I(v),v=-1):P=!0,Vt(b,J-ge))):(B.sortIndex=re,e(u,B),C||w||(C=!0,Rn(F))),B},t.unstable_shouldYield=k,t.unstable_wrapCallback=function(B){var Y=m;return function(){var J=m;m=Y;try{return B.apply(this,arguments)}finally{m=J}}}})(ZE);XE.exports=ZE;var vP=XE.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _P=L,xt=vP;function U(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var eI=new Set,ma={};function Vi(t,e){Ds(t,e),Ds(t+"Capture",e)}function Ds(t,e){for(ma[t]=e,t=0;t<e.length;t++)eI.add(e[t])}var Wn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),af=Object.prototype.hasOwnProperty,wP=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,ev={},tv={};function EP(t){return af.call(tv,t)?!0:af.call(ev,t)?!1:wP.test(t)?tv[t]=!0:(ev[t]=!0,!1)}function IP(t,e,n,r){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function TP(t,e,n,r){if(e===null||typeof e>"u"||IP(t,e,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function yt(t,e,n,r,i,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var Ye={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){Ye[t]=new yt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];Ye[e]=new yt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){Ye[t]=new yt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){Ye[t]=new yt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){Ye[t]=new yt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){Ye[t]=new yt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){Ye[t]=new yt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){Ye[t]=new yt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){Ye[t]=new yt(t,5,!1,t.toLowerCase(),null,!1,!1)});var Hp=/[\-:]([a-z])/g;function Wp(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(Hp,Wp);Ye[e]=new yt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(Hp,Wp);Ye[e]=new yt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(Hp,Wp);Ye[e]=new yt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){Ye[t]=new yt(t,1,!1,t.toLowerCase(),null,!1,!1)});Ye.xlinkHref=new yt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){Ye[t]=new yt(t,1,!1,t.toLowerCase(),null,!0,!0)});function qp(t,e,n,r){var i=Ye.hasOwnProperty(e)?Ye[e]:null;(i!==null?i.type!==0:r||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(TP(e,n,i,r)&&(n=null),r||i===null?EP(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):i.mustUseProperty?t[i.propertyName]=n===null?i.type===3?!1:"":n:(e=i.attributeName,r=i.attributeNamespace,n===null?t.removeAttribute(e):(i=i.type,n=i===3||i===4&&n===!0?"":""+n,r?t.setAttributeNS(r,e,n):t.setAttribute(e,n))))}var nr=_P.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,jl=Symbol.for("react.element"),ls=Symbol.for("react.portal"),us=Symbol.for("react.fragment"),Gp=Symbol.for("react.strict_mode"),lf=Symbol.for("react.profiler"),tI=Symbol.for("react.provider"),nI=Symbol.for("react.context"),Kp=Symbol.for("react.forward_ref"),uf=Symbol.for("react.suspense"),cf=Symbol.for("react.suspense_list"),Qp=Symbol.for("react.memo"),dr=Symbol.for("react.lazy"),rI=Symbol.for("react.offscreen"),nv=Symbol.iterator;function Po(t){return t===null||typeof t!="object"?null:(t=nv&&t[nv]||t["@@iterator"],typeof t=="function"?t:null)}var Pe=Object.assign,od;function Fo(t){if(od===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);od=e&&e[1]||""}return`
`+od+t}var ad=!1;function ld(t,e){if(!t||ad)return"";ad=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var r=c}Reflect.construct(t,[],e)}else{try{e.call()}catch(c){r=c}t.call(e.prototype)}else{try{throw Error()}catch(c){r=c}t()}}catch(c){if(c&&r&&typeof c.stack=="string"){for(var i=c.stack.split(`
`),s=r.stack.split(`
`),o=i.length-1,l=s.length-1;1<=o&&0<=l&&i[o]!==s[l];)l--;for(;1<=o&&0<=l;o--,l--)if(i[o]!==s[l]){if(o!==1||l!==1)do if(o--,l--,0>l||i[o]!==s[l]){var u=`
`+i[o].replace(" at new "," at ");return t.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",t.displayName)),u}while(1<=o&&0<=l);break}}}finally{ad=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?Fo(t):""}function SP(t){switch(t.tag){case 5:return Fo(t.type);case 16:return Fo("Lazy");case 13:return Fo("Suspense");case 19:return Fo("SuspenseList");case 0:case 2:case 15:return t=ld(t.type,!1),t;case 11:return t=ld(t.type.render,!1),t;case 1:return t=ld(t.type,!0),t;default:return""}}function hf(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case us:return"Fragment";case ls:return"Portal";case lf:return"Profiler";case Gp:return"StrictMode";case uf:return"Suspense";case cf:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case nI:return(t.displayName||"Context")+".Consumer";case tI:return(t._context.displayName||"Context")+".Provider";case Kp:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Qp:return e=t.displayName||null,e!==null?e:hf(t.type)||"Memo";case dr:e=t._payload,t=t._init;try{return hf(t(e))}catch{}}return null}function AP(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return hf(e);case 8:return e===Gp?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function $r(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function iI(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function CP(t){var e=iI(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),r=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var i=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return i.call(this)},set:function(o){r=""+o,s.call(this,o)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Bl(t){t._valueTracker||(t._valueTracker=CP(t))}function sI(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=iI(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function Uu(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function df(t,e){var n=e.checked;return Pe({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function rv(t,e){var n=e.defaultValue==null?"":e.defaultValue,r=e.checked!=null?e.checked:e.defaultChecked;n=$r(e.value!=null?e.value:n),t._wrapperState={initialChecked:r,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function oI(t,e){e=e.checked,e!=null&&qp(t,"checked",e,!1)}function ff(t,e){oI(t,e);var n=$r(e.value),r=e.type;if(n!=null)r==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(r==="submit"||r==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?pf(t,e.type,n):e.hasOwnProperty("defaultValue")&&pf(t,e.type,$r(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function iv(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var r=e.type;if(!(r!=="submit"&&r!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function pf(t,e,n){(e!=="number"||Uu(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var Uo=Array.isArray;function Is(t,e,n,r){if(t=t.options,e){e={};for(var i=0;i<n.length;i++)e["$"+n[i]]=!0;for(n=0;n<t.length;n++)i=e.hasOwnProperty("$"+t[n].value),t[n].selected!==i&&(t[n].selected=i),i&&r&&(t[n].defaultSelected=!0)}else{for(n=""+$r(n),e=null,i=0;i<t.length;i++){if(t[i].value===n){t[i].selected=!0,r&&(t[i].defaultSelected=!0);return}e!==null||t[i].disabled||(e=t[i])}e!==null&&(e.selected=!0)}}function mf(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(U(91));return Pe({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function sv(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(U(92));if(Uo(n)){if(1<n.length)throw Error(U(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:$r(n)}}function aI(t,e){var n=$r(e.value),r=$r(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),r!=null&&(t.defaultValue=""+r)}function ov(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function lI(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function gf(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?lI(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var zl,uI=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,r,i){MSApp.execUnsafeLocalFunction(function(){return t(e,n,r,i)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(zl=zl||document.createElement("div"),zl.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=zl.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function ga(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var Xo={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},PP=["Webkit","ms","Moz","O"];Object.keys(Xo).forEach(function(t){PP.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),Xo[e]=Xo[t]})});function cI(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||Xo.hasOwnProperty(t)&&Xo[t]?(""+e).trim():e+"px"}function hI(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var r=n.indexOf("--")===0,i=cI(n,e[n],r);n==="float"&&(n="cssFloat"),r?t.setProperty(n,i):t[n]=i}}var kP=Pe({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function yf(t,e){if(e){if(kP[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(U(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(U(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(U(61))}if(e.style!=null&&typeof e.style!="object")throw Error(U(62))}}function vf(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var _f=null;function Yp(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var wf=null,Ts=null,Ss=null;function av(t){if(t=nl(t)){if(typeof wf!="function")throw Error(U(280));var e=t.stateNode;e&&(e=Wc(e),wf(t.stateNode,t.type,e))}}function dI(t){Ts?Ss?Ss.push(t):Ss=[t]:Ts=t}function fI(){if(Ts){var t=Ts,e=Ss;if(Ss=Ts=null,av(t),e)for(t=0;t<e.length;t++)av(e[t])}}function pI(t,e){return t(e)}function mI(){}var ud=!1;function gI(t,e,n){if(ud)return t(e,n);ud=!0;try{return pI(t,e,n)}finally{ud=!1,(Ts!==null||Ss!==null)&&(mI(),fI())}}function ya(t,e){var n=t.stateNode;if(n===null)return null;var r=Wc(n);if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(U(231,e,typeof n));return n}var Ef=!1;if(Wn)try{var ko={};Object.defineProperty(ko,"passive",{get:function(){Ef=!0}}),window.addEventListener("test",ko,ko),window.removeEventListener("test",ko,ko)}catch{Ef=!1}function RP(t,e,n,r,i,s,o,l,u){var c=Array.prototype.slice.call(arguments,3);try{e.apply(n,c)}catch(d){this.onError(d)}}var Zo=!1,$u=null,ju=!1,If=null,bP={onError:function(t){Zo=!0,$u=t}};function NP(t,e,n,r,i,s,o,l,u){Zo=!1,$u=null,RP.apply(bP,arguments)}function OP(t,e,n,r,i,s,o,l,u){if(NP.apply(this,arguments),Zo){if(Zo){var c=$u;Zo=!1,$u=null}else throw Error(U(198));ju||(ju=!0,If=c)}}function Fi(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function yI(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function lv(t){if(Fi(t)!==t)throw Error(U(188))}function DP(t){var e=t.alternate;if(!e){if(e=Fi(t),e===null)throw Error(U(188));return e!==t?null:t}for(var n=t,r=e;;){var i=n.return;if(i===null)break;var s=i.alternate;if(s===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===s.child){for(s=i.child;s;){if(s===n)return lv(i),t;if(s===r)return lv(i),e;s=s.sibling}throw Error(U(188))}if(n.return!==r.return)n=i,r=s;else{for(var o=!1,l=i.child;l;){if(l===n){o=!0,n=i,r=s;break}if(l===r){o=!0,r=i,n=s;break}l=l.sibling}if(!o){for(l=s.child;l;){if(l===n){o=!0,n=s,r=i;break}if(l===r){o=!0,r=s,n=i;break}l=l.sibling}if(!o)throw Error(U(189))}}if(n.alternate!==r)throw Error(U(190))}if(n.tag!==3)throw Error(U(188));return n.stateNode.current===n?t:e}function vI(t){return t=DP(t),t!==null?_I(t):null}function _I(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=_I(t);if(e!==null)return e;t=t.sibling}return null}var wI=xt.unstable_scheduleCallback,uv=xt.unstable_cancelCallback,xP=xt.unstable_shouldYield,MP=xt.unstable_requestPaint,De=xt.unstable_now,LP=xt.unstable_getCurrentPriorityLevel,Jp=xt.unstable_ImmediatePriority,EI=xt.unstable_UserBlockingPriority,Bu=xt.unstable_NormalPriority,VP=xt.unstable_LowPriority,II=xt.unstable_IdlePriority,jc=null,yn=null;function FP(t){if(yn&&typeof yn.onCommitFiberRoot=="function")try{yn.onCommitFiberRoot(jc,t,void 0,(t.current.flags&128)===128)}catch{}}var nn=Math.clz32?Math.clz32:jP,UP=Math.log,$P=Math.LN2;function jP(t){return t>>>=0,t===0?32:31-(UP(t)/$P|0)|0}var Hl=64,Wl=4194304;function $o(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function zu(t,e){var n=t.pendingLanes;if(n===0)return 0;var r=0,i=t.suspendedLanes,s=t.pingedLanes,o=n&268435455;if(o!==0){var l=o&~i;l!==0?r=$o(l):(s&=o,s!==0&&(r=$o(s)))}else o=n&~i,o!==0?r=$o(o):s!==0&&(r=$o(s));if(r===0)return 0;if(e!==0&&e!==r&&!(e&i)&&(i=r&-r,s=e&-e,i>=s||i===16&&(s&4194240)!==0))return e;if(r&4&&(r|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=r;0<e;)n=31-nn(e),i=1<<n,r|=t[n],e&=~i;return r}function BP(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function zP(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,i=t.expirationTimes,s=t.pendingLanes;0<s;){var o=31-nn(s),l=1<<o,u=i[o];u===-1?(!(l&n)||l&r)&&(i[o]=BP(l,e)):u<=e&&(t.expiredLanes|=l),s&=~l}}function Tf(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function TI(){var t=Hl;return Hl<<=1,!(Hl&4194240)&&(Hl=64),t}function cd(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function el(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-nn(e),t[e]=n}function HP(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var r=t.eventTimes;for(t=t.expirationTimes;0<n;){var i=31-nn(n),s=1<<i;e[i]=0,r[i]=-1,t[i]=-1,n&=~s}}function Xp(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-nn(n),i=1<<r;i&e|t[r]&e&&(t[r]|=e),n&=~i}}var he=0;function SI(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var AI,Zp,CI,PI,kI,Sf=!1,ql=[],Ar=null,Cr=null,Pr=null,va=new Map,_a=new Map,pr=[],WP="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function cv(t,e){switch(t){case"focusin":case"focusout":Ar=null;break;case"dragenter":case"dragleave":Cr=null;break;case"mouseover":case"mouseout":Pr=null;break;case"pointerover":case"pointerout":va.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":_a.delete(e.pointerId)}}function Ro(t,e,n,r,i,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:s,targetContainers:[i]},e!==null&&(e=nl(e),e!==null&&Zp(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,i!==null&&e.indexOf(i)===-1&&e.push(i),t)}function qP(t,e,n,r,i){switch(e){case"focusin":return Ar=Ro(Ar,t,e,n,r,i),!0;case"dragenter":return Cr=Ro(Cr,t,e,n,r,i),!0;case"mouseover":return Pr=Ro(Pr,t,e,n,r,i),!0;case"pointerover":var s=i.pointerId;return va.set(s,Ro(va.get(s)||null,t,e,n,r,i)),!0;case"gotpointercapture":return s=i.pointerId,_a.set(s,Ro(_a.get(s)||null,t,e,n,r,i)),!0}return!1}function RI(t){var e=fi(t.target);if(e!==null){var n=Fi(e);if(n!==null){if(e=n.tag,e===13){if(e=yI(n),e!==null){t.blockedOn=e,kI(t.priority,function(){CI(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function pu(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Af(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);_f=r,n.target.dispatchEvent(r),_f=null}else return e=nl(n),e!==null&&Zp(e),t.blockedOn=n,!1;e.shift()}return!0}function hv(t,e,n){pu(t)&&n.delete(e)}function GP(){Sf=!1,Ar!==null&&pu(Ar)&&(Ar=null),Cr!==null&&pu(Cr)&&(Cr=null),Pr!==null&&pu(Pr)&&(Pr=null),va.forEach(hv),_a.forEach(hv)}function bo(t,e){t.blockedOn===e&&(t.blockedOn=null,Sf||(Sf=!0,xt.unstable_scheduleCallback(xt.unstable_NormalPriority,GP)))}function wa(t){function e(i){return bo(i,t)}if(0<ql.length){bo(ql[0],t);for(var n=1;n<ql.length;n++){var r=ql[n];r.blockedOn===t&&(r.blockedOn=null)}}for(Ar!==null&&bo(Ar,t),Cr!==null&&bo(Cr,t),Pr!==null&&bo(Pr,t),va.forEach(e),_a.forEach(e),n=0;n<pr.length;n++)r=pr[n],r.blockedOn===t&&(r.blockedOn=null);for(;0<pr.length&&(n=pr[0],n.blockedOn===null);)RI(n),n.blockedOn===null&&pr.shift()}var As=nr.ReactCurrentBatchConfig,Hu=!0;function KP(t,e,n,r){var i=he,s=As.transition;As.transition=null;try{he=1,em(t,e,n,r)}finally{he=i,As.transition=s}}function QP(t,e,n,r){var i=he,s=As.transition;As.transition=null;try{he=4,em(t,e,n,r)}finally{he=i,As.transition=s}}function em(t,e,n,r){if(Hu){var i=Af(t,e,n,r);if(i===null)wd(t,e,r,Wu,n),cv(t,r);else if(qP(i,t,e,n,r))r.stopPropagation();else if(cv(t,r),e&4&&-1<WP.indexOf(t)){for(;i!==null;){var s=nl(i);if(s!==null&&AI(s),s=Af(t,e,n,r),s===null&&wd(t,e,r,Wu,n),s===i)break;i=s}i!==null&&r.stopPropagation()}else wd(t,e,r,null,n)}}var Wu=null;function Af(t,e,n,r){if(Wu=null,t=Yp(r),t=fi(t),t!==null)if(e=Fi(t),e===null)t=null;else if(n=e.tag,n===13){if(t=yI(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return Wu=t,null}function bI(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(LP()){case Jp:return 1;case EI:return 4;case Bu:case VP:return 16;case II:return 536870912;default:return 16}default:return 16}}var wr=null,tm=null,mu=null;function NI(){if(mu)return mu;var t,e=tm,n=e.length,r,i="value"in wr?wr.value:wr.textContent,s=i.length;for(t=0;t<n&&e[t]===i[t];t++);var o=n-t;for(r=1;r<=o&&e[n-r]===i[s-r];r++);return mu=i.slice(t,1<r?1-r:void 0)}function gu(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Gl(){return!0}function dv(){return!1}function Lt(t){function e(n,r,i,s,o){this._reactName=n,this._targetInst=i,this.type=r,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(s):s[l]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Gl:dv,this.isPropagationStopped=dv,this}return Pe(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Gl)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Gl)},persist:function(){},isPersistent:Gl}),e}var Xs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},nm=Lt(Xs),tl=Pe({},Xs,{view:0,detail:0}),YP=Lt(tl),hd,dd,No,Bc=Pe({},tl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:rm,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==No&&(No&&t.type==="mousemove"?(hd=t.screenX-No.screenX,dd=t.screenY-No.screenY):dd=hd=0,No=t),hd)},movementY:function(t){return"movementY"in t?t.movementY:dd}}),fv=Lt(Bc),JP=Pe({},Bc,{dataTransfer:0}),XP=Lt(JP),ZP=Pe({},tl,{relatedTarget:0}),fd=Lt(ZP),ek=Pe({},Xs,{animationName:0,elapsedTime:0,pseudoElement:0}),tk=Lt(ek),nk=Pe({},Xs,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),rk=Lt(nk),ik=Pe({},Xs,{data:0}),pv=Lt(ik),sk={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},ok={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},ak={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function lk(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=ak[t])?!!e[t]:!1}function rm(){return lk}var uk=Pe({},tl,{key:function(t){if(t.key){var e=sk[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=gu(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?ok[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:rm,charCode:function(t){return t.type==="keypress"?gu(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?gu(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),ck=Lt(uk),hk=Pe({},Bc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),mv=Lt(hk),dk=Pe({},tl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:rm}),fk=Lt(dk),pk=Pe({},Xs,{propertyName:0,elapsedTime:0,pseudoElement:0}),mk=Lt(pk),gk=Pe({},Bc,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),yk=Lt(gk),vk=[9,13,27,32],im=Wn&&"CompositionEvent"in window,ea=null;Wn&&"documentMode"in document&&(ea=document.documentMode);var _k=Wn&&"TextEvent"in window&&!ea,OI=Wn&&(!im||ea&&8<ea&&11>=ea),gv=" ",yv=!1;function DI(t,e){switch(t){case"keyup":return vk.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function xI(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var cs=!1;function wk(t,e){switch(t){case"compositionend":return xI(e);case"keypress":return e.which!==32?null:(yv=!0,gv);case"textInput":return t=e.data,t===gv&&yv?null:t;default:return null}}function Ek(t,e){if(cs)return t==="compositionend"||!im&&DI(t,e)?(t=NI(),mu=tm=wr=null,cs=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return OI&&e.locale!=="ko"?null:e.data;default:return null}}var Ik={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function vv(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!Ik[t.type]:e==="textarea"}function MI(t,e,n,r){dI(r),e=qu(e,"onChange"),0<e.length&&(n=new nm("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var ta=null,Ea=null;function Tk(t){qI(t,0)}function zc(t){var e=fs(t);if(sI(e))return t}function Sk(t,e){if(t==="change")return e}var LI=!1;if(Wn){var pd;if(Wn){var md="oninput"in document;if(!md){var _v=document.createElement("div");_v.setAttribute("oninput","return;"),md=typeof _v.oninput=="function"}pd=md}else pd=!1;LI=pd&&(!document.documentMode||9<document.documentMode)}function wv(){ta&&(ta.detachEvent("onpropertychange",VI),Ea=ta=null)}function VI(t){if(t.propertyName==="value"&&zc(Ea)){var e=[];MI(e,Ea,t,Yp(t)),gI(Tk,e)}}function Ak(t,e,n){t==="focusin"?(wv(),ta=e,Ea=n,ta.attachEvent("onpropertychange",VI)):t==="focusout"&&wv()}function Ck(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return zc(Ea)}function Pk(t,e){if(t==="click")return zc(e)}function kk(t,e){if(t==="input"||t==="change")return zc(e)}function Rk(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var an=typeof Object.is=="function"?Object.is:Rk;function Ia(t,e){if(an(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!af.call(e,i)||!an(t[i],e[i]))return!1}return!0}function Ev(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Iv(t,e){var n=Ev(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Ev(n)}}function FI(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?FI(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function UI(){for(var t=window,e=Uu();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Uu(t.document)}return e}function sm(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function bk(t){var e=UI(),n=t.focusedElem,r=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&FI(n.ownerDocument.documentElement,n)){if(r!==null&&sm(n)){if(e=r.start,t=r.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var i=n.textContent.length,s=Math.min(r.start,i);r=r.end===void 0?s:Math.min(r.end,i),!t.extend&&s>r&&(i=r,r=s,s=i),i=Iv(n,s);var o=Iv(n,r);i&&o&&(t.rangeCount!==1||t.anchorNode!==i.node||t.anchorOffset!==i.offset||t.focusNode!==o.node||t.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(i.node,i.offset),t.removeAllRanges(),s>r?(t.addRange(e),t.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var Nk=Wn&&"documentMode"in document&&11>=document.documentMode,hs=null,Cf=null,na=null,Pf=!1;function Tv(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Pf||hs==null||hs!==Uu(r)||(r=hs,"selectionStart"in r&&sm(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),na&&Ia(na,r)||(na=r,r=qu(Cf,"onSelect"),0<r.length&&(e=new nm("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=hs)))}function Kl(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var ds={animationend:Kl("Animation","AnimationEnd"),animationiteration:Kl("Animation","AnimationIteration"),animationstart:Kl("Animation","AnimationStart"),transitionend:Kl("Transition","TransitionEnd")},gd={},$I={};Wn&&($I=document.createElement("div").style,"AnimationEvent"in window||(delete ds.animationend.animation,delete ds.animationiteration.animation,delete ds.animationstart.animation),"TransitionEvent"in window||delete ds.transitionend.transition);function Hc(t){if(gd[t])return gd[t];if(!ds[t])return t;var e=ds[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in $I)return gd[t]=e[n];return t}var jI=Hc("animationend"),BI=Hc("animationiteration"),zI=Hc("animationstart"),HI=Hc("transitionend"),WI=new Map,Sv="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Qr(t,e){WI.set(t,e),Vi(e,[t])}for(var yd=0;yd<Sv.length;yd++){var vd=Sv[yd],Ok=vd.toLowerCase(),Dk=vd[0].toUpperCase()+vd.slice(1);Qr(Ok,"on"+Dk)}Qr(jI,"onAnimationEnd");Qr(BI,"onAnimationIteration");Qr(zI,"onAnimationStart");Qr("dblclick","onDoubleClick");Qr("focusin","onFocus");Qr("focusout","onBlur");Qr(HI,"onTransitionEnd");Ds("onMouseEnter",["mouseout","mouseover"]);Ds("onMouseLeave",["mouseout","mouseover"]);Ds("onPointerEnter",["pointerout","pointerover"]);Ds("onPointerLeave",["pointerout","pointerover"]);Vi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Vi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Vi("onBeforeInput",["compositionend","keypress","textInput","paste"]);Vi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Vi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Vi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var jo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),xk=new Set("cancel close invalid load scroll toggle".split(" ").concat(jo));function Av(t,e,n){var r=t.type||"unknown-event";t.currentTarget=n,OP(r,e,void 0,t),t.currentTarget=null}function qI(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],i=r.event;r=r.listeners;e:{var s=void 0;if(e)for(var o=r.length-1;0<=o;o--){var l=r[o],u=l.instance,c=l.currentTarget;if(l=l.listener,u!==s&&i.isPropagationStopped())break e;Av(i,l,c),s=u}else for(o=0;o<r.length;o++){if(l=r[o],u=l.instance,c=l.currentTarget,l=l.listener,u!==s&&i.isPropagationStopped())break e;Av(i,l,c),s=u}}}if(ju)throw t=If,ju=!1,If=null,t}function ve(t,e){var n=e[Of];n===void 0&&(n=e[Of]=new Set);var r=t+"__bubble";n.has(r)||(GI(e,t,2,!1),n.add(r))}function _d(t,e,n){var r=0;e&&(r|=4),GI(n,t,r,e)}var Ql="_reactListening"+Math.random().toString(36).slice(2);function Ta(t){if(!t[Ql]){t[Ql]=!0,eI.forEach(function(n){n!=="selectionchange"&&(xk.has(n)||_d(n,!1,t),_d(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Ql]||(e[Ql]=!0,_d("selectionchange",!1,e))}}function GI(t,e,n,r){switch(bI(e)){case 1:var i=KP;break;case 4:i=QP;break;default:i=em}n=i.bind(null,e,n,t),i=void 0,!Ef||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(i=!0),r?i!==void 0?t.addEventListener(e,n,{capture:!0,passive:i}):t.addEventListener(e,n,!0):i!==void 0?t.addEventListener(e,n,{passive:i}):t.addEventListener(e,n,!1)}function wd(t,e,n,r,i){var s=r;if(!(e&1)&&!(e&2)&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var l=r.stateNode.containerInfo;if(l===i||l.nodeType===8&&l.parentNode===i)break;if(o===4)for(o=r.return;o!==null;){var u=o.tag;if((u===3||u===4)&&(u=o.stateNode.containerInfo,u===i||u.nodeType===8&&u.parentNode===i))return;o=o.return}for(;l!==null;){if(o=fi(l),o===null)return;if(u=o.tag,u===5||u===6){r=s=o;continue e}l=l.parentNode}}r=r.return}gI(function(){var c=s,d=Yp(n),p=[];e:{var m=WI.get(t);if(m!==void 0){var w=nm,C=t;switch(t){case"keypress":if(gu(n)===0)break e;case"keydown":case"keyup":w=ck;break;case"focusin":C="focus",w=fd;break;case"focusout":C="blur",w=fd;break;case"beforeblur":case"afterblur":w=fd;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":w=fv;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":w=XP;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":w=fk;break;case jI:case BI:case zI:w=tk;break;case HI:w=mk;break;case"scroll":w=YP;break;case"wheel":w=yk;break;case"copy":case"cut":case"paste":w=rk;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":w=mv}var P=(e&4)!==0,N=!P&&t==="scroll",I=P?m!==null?m+"Capture":null:m;P=[];for(var y=c,S;y!==null;){S=y;var b=S.stateNode;if(S.tag===5&&b!==null&&(S=b,I!==null&&(b=ya(y,I),b!=null&&P.push(Sa(y,b,S)))),N)break;y=y.return}0<P.length&&(m=new w(m,C,null,n,d),p.push({event:m,listeners:P}))}}if(!(e&7)){e:{if(m=t==="mouseover"||t==="pointerover",w=t==="mouseout"||t==="pointerout",m&&n!==_f&&(C=n.relatedTarget||n.fromElement)&&(fi(C)||C[qn]))break e;if((w||m)&&(m=d.window===d?d:(m=d.ownerDocument)?m.defaultView||m.parentWindow:window,w?(C=n.relatedTarget||n.toElement,w=c,C=C?fi(C):null,C!==null&&(N=Fi(C),C!==N||C.tag!==5&&C.tag!==6)&&(C=null)):(w=null,C=c),w!==C)){if(P=fv,b="onMouseLeave",I="onMouseEnter",y="mouse",(t==="pointerout"||t==="pointerover")&&(P=mv,b="onPointerLeave",I="onPointerEnter",y="pointer"),N=w==null?m:fs(w),S=C==null?m:fs(C),m=new P(b,y+"leave",w,n,d),m.target=N,m.relatedTarget=S,b=null,fi(d)===c&&(P=new P(I,y+"enter",C,n,d),P.target=S,P.relatedTarget=N,b=P),N=b,w&&C)t:{for(P=w,I=C,y=0,S=P;S;S=Ji(S))y++;for(S=0,b=I;b;b=Ji(b))S++;for(;0<y-S;)P=Ji(P),y--;for(;0<S-y;)I=Ji(I),S--;for(;y--;){if(P===I||I!==null&&P===I.alternate)break t;P=Ji(P),I=Ji(I)}P=null}else P=null;w!==null&&Cv(p,m,w,P,!1),C!==null&&N!==null&&Cv(p,N,C,P,!0)}}e:{if(m=c?fs(c):window,w=m.nodeName&&m.nodeName.toLowerCase(),w==="select"||w==="input"&&m.type==="file")var F=Sk;else if(vv(m))if(LI)F=kk;else{F=Ck;var $=Ak}else(w=m.nodeName)&&w.toLowerCase()==="input"&&(m.type==="checkbox"||m.type==="radio")&&(F=Pk);if(F&&(F=F(t,c))){MI(p,F,n,d);break e}$&&$(t,m,c),t==="focusout"&&($=m._wrapperState)&&$.controlled&&m.type==="number"&&pf(m,"number",m.value)}switch($=c?fs(c):window,t){case"focusin":(vv($)||$.contentEditable==="true")&&(hs=$,Cf=c,na=null);break;case"focusout":na=Cf=hs=null;break;case"mousedown":Pf=!0;break;case"contextmenu":case"mouseup":case"dragend":Pf=!1,Tv(p,n,d);break;case"selectionchange":if(Nk)break;case"keydown":case"keyup":Tv(p,n,d)}var _;if(im)e:{switch(t){case"compositionstart":var v="onCompositionStart";break e;case"compositionend":v="onCompositionEnd";break e;case"compositionupdate":v="onCompositionUpdate";break e}v=void 0}else cs?DI(t,n)&&(v="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(v="onCompositionStart");v&&(OI&&n.locale!=="ko"&&(cs||v!=="onCompositionStart"?v==="onCompositionEnd"&&cs&&(_=NI()):(wr=d,tm="value"in wr?wr.value:wr.textContent,cs=!0)),$=qu(c,v),0<$.length&&(v=new pv(v,t,null,n,d),p.push({event:v,listeners:$}),_?v.data=_:(_=xI(n),_!==null&&(v.data=_)))),(_=_k?wk(t,n):Ek(t,n))&&(c=qu(c,"onBeforeInput"),0<c.length&&(d=new pv("onBeforeInput","beforeinput",null,n,d),p.push({event:d,listeners:c}),d.data=_))}qI(p,e)})}function Sa(t,e,n){return{instance:t,listener:e,currentTarget:n}}function qu(t,e){for(var n=e+"Capture",r=[];t!==null;){var i=t,s=i.stateNode;i.tag===5&&s!==null&&(i=s,s=ya(t,n),s!=null&&r.unshift(Sa(t,s,i)),s=ya(t,e),s!=null&&r.push(Sa(t,s,i))),t=t.return}return r}function Ji(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function Cv(t,e,n,r,i){for(var s=e._reactName,o=[];n!==null&&n!==r;){var l=n,u=l.alternate,c=l.stateNode;if(u!==null&&u===r)break;l.tag===5&&c!==null&&(l=c,i?(u=ya(n,s),u!=null&&o.unshift(Sa(n,u,l))):i||(u=ya(n,s),u!=null&&o.push(Sa(n,u,l)))),n=n.return}o.length!==0&&t.push({event:e,listeners:o})}var Mk=/\r\n?/g,Lk=/\u0000|\uFFFD/g;function Pv(t){return(typeof t=="string"?t:""+t).replace(Mk,`
`).replace(Lk,"")}function Yl(t,e,n){if(e=Pv(e),Pv(t)!==e&&n)throw Error(U(425))}function Gu(){}var kf=null,Rf=null;function bf(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Nf=typeof setTimeout=="function"?setTimeout:void 0,Vk=typeof clearTimeout=="function"?clearTimeout:void 0,kv=typeof Promise=="function"?Promise:void 0,Fk=typeof queueMicrotask=="function"?queueMicrotask:typeof kv<"u"?function(t){return kv.resolve(null).then(t).catch(Uk)}:Nf;function Uk(t){setTimeout(function(){throw t})}function Ed(t,e){var n=e,r=0;do{var i=n.nextSibling;if(t.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(r===0){t.removeChild(i),wa(e);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=i}while(n);wa(e)}function kr(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function Rv(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Zs=Math.random().toString(36).slice(2),gn="__reactFiber$"+Zs,Aa="__reactProps$"+Zs,qn="__reactContainer$"+Zs,Of="__reactEvents$"+Zs,$k="__reactListeners$"+Zs,jk="__reactHandles$"+Zs;function fi(t){var e=t[gn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[qn]||n[gn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Rv(t);t!==null;){if(n=t[gn])return n;t=Rv(t)}return e}t=n,n=t.parentNode}return null}function nl(t){return t=t[gn]||t[qn],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function fs(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(U(33))}function Wc(t){return t[Aa]||null}var Df=[],ps=-1;function Yr(t){return{current:t}}function we(t){0>ps||(t.current=Df[ps],Df[ps]=null,ps--)}function me(t,e){ps++,Df[ps]=t.current,t.current=e}var jr={},lt=Yr(jr),Tt=Yr(!1),Si=jr;function xs(t,e){var n=t.type.contextTypes;if(!n)return jr;var r=t.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===e)return r.__reactInternalMemoizedMaskedChildContext;var i={},s;for(s in n)i[s]=e[s];return r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=i),i}function St(t){return t=t.childContextTypes,t!=null}function Ku(){we(Tt),we(lt)}function bv(t,e,n){if(lt.current!==jr)throw Error(U(168));me(lt,e),me(Tt,n)}function KI(t,e,n){var r=t.stateNode;if(e=e.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var i in r)if(!(i in e))throw Error(U(108,AP(t)||"Unknown",i));return Pe({},n,r)}function Qu(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||jr,Si=lt.current,me(lt,t),me(Tt,Tt.current),!0}function Nv(t,e,n){var r=t.stateNode;if(!r)throw Error(U(169));n?(t=KI(t,e,Si),r.__reactInternalMemoizedMergedChildContext=t,we(Tt),we(lt),me(lt,t)):we(Tt),me(Tt,n)}var Mn=null,qc=!1,Id=!1;function QI(t){Mn===null?Mn=[t]:Mn.push(t)}function Bk(t){qc=!0,QI(t)}function Jr(){if(!Id&&Mn!==null){Id=!0;var t=0,e=he;try{var n=Mn;for(he=1;t<n.length;t++){var r=n[t];do r=r(!0);while(r!==null)}Mn=null,qc=!1}catch(i){throw Mn!==null&&(Mn=Mn.slice(t+1)),wI(Jp,Jr),i}finally{he=e,Id=!1}}return null}var ms=[],gs=0,Yu=null,Ju=0,$t=[],jt=0,Ai=null,Ln=1,Vn="";function li(t,e){ms[gs++]=Ju,ms[gs++]=Yu,Yu=t,Ju=e}function YI(t,e,n){$t[jt++]=Ln,$t[jt++]=Vn,$t[jt++]=Ai,Ai=t;var r=Ln;t=Vn;var i=32-nn(r)-1;r&=~(1<<i),n+=1;var s=32-nn(e)+i;if(30<s){var o=i-i%5;s=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Ln=1<<32-nn(e)+i|n<<i|r,Vn=s+t}else Ln=1<<s|n<<i|r,Vn=t}function om(t){t.return!==null&&(li(t,1),YI(t,1,0))}function am(t){for(;t===Yu;)Yu=ms[--gs],ms[gs]=null,Ju=ms[--gs],ms[gs]=null;for(;t===Ai;)Ai=$t[--jt],$t[jt]=null,Vn=$t[--jt],$t[jt]=null,Ln=$t[--jt],$t[jt]=null}var Dt=null,Nt=null,Ee=!1,tn=null;function JI(t,e){var n=Ht(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function Ov(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,Dt=t,Nt=kr(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,Dt=t,Nt=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=Ai!==null?{id:Ln,overflow:Vn}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=Ht(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,Dt=t,Nt=null,!0):!1;default:return!1}}function xf(t){return(t.mode&1)!==0&&(t.flags&128)===0}function Mf(t){if(Ee){var e=Nt;if(e){var n=e;if(!Ov(t,e)){if(xf(t))throw Error(U(418));e=kr(n.nextSibling);var r=Dt;e&&Ov(t,e)?JI(r,n):(t.flags=t.flags&-4097|2,Ee=!1,Dt=t)}}else{if(xf(t))throw Error(U(418));t.flags=t.flags&-4097|2,Ee=!1,Dt=t}}}function Dv(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;Dt=t}function Jl(t){if(t!==Dt)return!1;if(!Ee)return Dv(t),Ee=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!bf(t.type,t.memoizedProps)),e&&(e=Nt)){if(xf(t))throw XI(),Error(U(418));for(;e;)JI(t,e),e=kr(e.nextSibling)}if(Dv(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(U(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){Nt=kr(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}Nt=null}}else Nt=Dt?kr(t.stateNode.nextSibling):null;return!0}function XI(){for(var t=Nt;t;)t=kr(t.nextSibling)}function Ms(){Nt=Dt=null,Ee=!1}function lm(t){tn===null?tn=[t]:tn.push(t)}var zk=nr.ReactCurrentBatchConfig;function Oo(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(U(309));var r=n.stateNode}if(!r)throw Error(U(147,t));var i=r,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var l=i.refs;o===null?delete l[s]:l[s]=o},e._stringRef=s,e)}if(typeof t!="string")throw Error(U(284));if(!n._owner)throw Error(U(290,t))}return t}function Xl(t,e){throw t=Object.prototype.toString.call(e),Error(U(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function xv(t){var e=t._init;return e(t._payload)}function ZI(t){function e(I,y){if(t){var S=I.deletions;S===null?(I.deletions=[y],I.flags|=16):S.push(y)}}function n(I,y){if(!t)return null;for(;y!==null;)e(I,y),y=y.sibling;return null}function r(I,y){for(I=new Map;y!==null;)y.key!==null?I.set(y.key,y):I.set(y.index,y),y=y.sibling;return I}function i(I,y){return I=Or(I,y),I.index=0,I.sibling=null,I}function s(I,y,S){return I.index=S,t?(S=I.alternate,S!==null?(S=S.index,S<y?(I.flags|=2,y):S):(I.flags|=2,y)):(I.flags|=1048576,y)}function o(I){return t&&I.alternate===null&&(I.flags|=2),I}function l(I,y,S,b){return y===null||y.tag!==6?(y=Rd(S,I.mode,b),y.return=I,y):(y=i(y,S),y.return=I,y)}function u(I,y,S,b){var F=S.type;return F===us?d(I,y,S.props.children,b,S.key):y!==null&&(y.elementType===F||typeof F=="object"&&F!==null&&F.$$typeof===dr&&xv(F)===y.type)?(b=i(y,S.props),b.ref=Oo(I,y,S),b.return=I,b):(b=Tu(S.type,S.key,S.props,null,I.mode,b),b.ref=Oo(I,y,S),b.return=I,b)}function c(I,y,S,b){return y===null||y.tag!==4||y.stateNode.containerInfo!==S.containerInfo||y.stateNode.implementation!==S.implementation?(y=bd(S,I.mode,b),y.return=I,y):(y=i(y,S.children||[]),y.return=I,y)}function d(I,y,S,b,F){return y===null||y.tag!==7?(y=wi(S,I.mode,b,F),y.return=I,y):(y=i(y,S),y.return=I,y)}function p(I,y,S){if(typeof y=="string"&&y!==""||typeof y=="number")return y=Rd(""+y,I.mode,S),y.return=I,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case jl:return S=Tu(y.type,y.key,y.props,null,I.mode,S),S.ref=Oo(I,null,y),S.return=I,S;case ls:return y=bd(y,I.mode,S),y.return=I,y;case dr:var b=y._init;return p(I,b(y._payload),S)}if(Uo(y)||Po(y))return y=wi(y,I.mode,S,null),y.return=I,y;Xl(I,y)}return null}function m(I,y,S,b){var F=y!==null?y.key:null;if(typeof S=="string"&&S!==""||typeof S=="number")return F!==null?null:l(I,y,""+S,b);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case jl:return S.key===F?u(I,y,S,b):null;case ls:return S.key===F?c(I,y,S,b):null;case dr:return F=S._init,m(I,y,F(S._payload),b)}if(Uo(S)||Po(S))return F!==null?null:d(I,y,S,b,null);Xl(I,S)}return null}function w(I,y,S,b,F){if(typeof b=="string"&&b!==""||typeof b=="number")return I=I.get(S)||null,l(y,I,""+b,F);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case jl:return I=I.get(b.key===null?S:b.key)||null,u(y,I,b,F);case ls:return I=I.get(b.key===null?S:b.key)||null,c(y,I,b,F);case dr:var $=b._init;return w(I,y,S,$(b._payload),F)}if(Uo(b)||Po(b))return I=I.get(S)||null,d(y,I,b,F,null);Xl(y,b)}return null}function C(I,y,S,b){for(var F=null,$=null,_=y,v=y=0,E=null;_!==null&&v<S.length;v++){_.index>v?(E=_,_=null):E=_.sibling;var T=m(I,_,S[v],b);if(T===null){_===null&&(_=E);break}t&&_&&T.alternate===null&&e(I,_),y=s(T,y,v),$===null?F=T:$.sibling=T,$=T,_=E}if(v===S.length)return n(I,_),Ee&&li(I,v),F;if(_===null){for(;v<S.length;v++)_=p(I,S[v],b),_!==null&&(y=s(_,y,v),$===null?F=_:$.sibling=_,$=_);return Ee&&li(I,v),F}for(_=r(I,_);v<S.length;v++)E=w(_,I,v,S[v],b),E!==null&&(t&&E.alternate!==null&&_.delete(E.key===null?v:E.key),y=s(E,y,v),$===null?F=E:$.sibling=E,$=E);return t&&_.forEach(function(k){return e(I,k)}),Ee&&li(I,v),F}function P(I,y,S,b){var F=Po(S);if(typeof F!="function")throw Error(U(150));if(S=F.call(S),S==null)throw Error(U(151));for(var $=F=null,_=y,v=y=0,E=null,T=S.next();_!==null&&!T.done;v++,T=S.next()){_.index>v?(E=_,_=null):E=_.sibling;var k=m(I,_,T.value,b);if(k===null){_===null&&(_=E);break}t&&_&&k.alternate===null&&e(I,_),y=s(k,y,v),$===null?F=k:$.sibling=k,$=k,_=E}if(T.done)return n(I,_),Ee&&li(I,v),F;if(_===null){for(;!T.done;v++,T=S.next())T=p(I,T.value,b),T!==null&&(y=s(T,y,v),$===null?F=T:$.sibling=T,$=T);return Ee&&li(I,v),F}for(_=r(I,_);!T.done;v++,T=S.next())T=w(_,I,v,T.value,b),T!==null&&(t&&T.alternate!==null&&_.delete(T.key===null?v:T.key),y=s(T,y,v),$===null?F=T:$.sibling=T,$=T);return t&&_.forEach(function(R){return e(I,R)}),Ee&&li(I,v),F}function N(I,y,S,b){if(typeof S=="object"&&S!==null&&S.type===us&&S.key===null&&(S=S.props.children),typeof S=="object"&&S!==null){switch(S.$$typeof){case jl:e:{for(var F=S.key,$=y;$!==null;){if($.key===F){if(F=S.type,F===us){if($.tag===7){n(I,$.sibling),y=i($,S.props.children),y.return=I,I=y;break e}}else if($.elementType===F||typeof F=="object"&&F!==null&&F.$$typeof===dr&&xv(F)===$.type){n(I,$.sibling),y=i($,S.props),y.ref=Oo(I,$,S),y.return=I,I=y;break e}n(I,$);break}else e(I,$);$=$.sibling}S.type===us?(y=wi(S.props.children,I.mode,b,S.key),y.return=I,I=y):(b=Tu(S.type,S.key,S.props,null,I.mode,b),b.ref=Oo(I,y,S),b.return=I,I=b)}return o(I);case ls:e:{for($=S.key;y!==null;){if(y.key===$)if(y.tag===4&&y.stateNode.containerInfo===S.containerInfo&&y.stateNode.implementation===S.implementation){n(I,y.sibling),y=i(y,S.children||[]),y.return=I,I=y;break e}else{n(I,y);break}else e(I,y);y=y.sibling}y=bd(S,I.mode,b),y.return=I,I=y}return o(I);case dr:return $=S._init,N(I,y,$(S._payload),b)}if(Uo(S))return C(I,y,S,b);if(Po(S))return P(I,y,S,b);Xl(I,S)}return typeof S=="string"&&S!==""||typeof S=="number"?(S=""+S,y!==null&&y.tag===6?(n(I,y.sibling),y=i(y,S),y.return=I,I=y):(n(I,y),y=Rd(S,I.mode,b),y.return=I,I=y),o(I)):n(I,y)}return N}var Ls=ZI(!0),eT=ZI(!1),Xu=Yr(null),Zu=null,ys=null,um=null;function cm(){um=ys=Zu=null}function hm(t){var e=Xu.current;we(Xu),t._currentValue=e}function Lf(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function Cs(t,e){Zu=t,um=ys=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(Et=!0),t.firstContext=null)}function qt(t){var e=t._currentValue;if(um!==t)if(t={context:t,memoizedValue:e,next:null},ys===null){if(Zu===null)throw Error(U(308));ys=t,Zu.dependencies={lanes:0,firstContext:t}}else ys=ys.next=t;return e}var pi=null;function dm(t){pi===null?pi=[t]:pi.push(t)}function tT(t,e,n,r){var i=e.interleaved;return i===null?(n.next=n,dm(e)):(n.next=i.next,i.next=n),e.interleaved=n,Gn(t,r)}function Gn(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var fr=!1;function fm(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function nT(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function zn(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function Rr(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,ae&2){var i=r.pending;return i===null?e.next=e:(e.next=i.next,i.next=e),r.pending=e,Gn(t,n)}return i=r.interleaved,i===null?(e.next=e,dm(r)):(e.next=i.next,i.next=e),r.interleaved=e,Gn(t,n)}function yu(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Xp(t,n)}}function Mv(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?i=s=o:s=s.next=o,n=n.next}while(n!==null);s===null?i=s=e:s=s.next=e}else i=s=e;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:s,shared:r.shared,effects:r.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function ec(t,e,n,r){var i=t.updateQueue;fr=!1;var s=i.firstBaseUpdate,o=i.lastBaseUpdate,l=i.shared.pending;if(l!==null){i.shared.pending=null;var u=l,c=u.next;u.next=null,o===null?s=c:o.next=c,o=u;var d=t.alternate;d!==null&&(d=d.updateQueue,l=d.lastBaseUpdate,l!==o&&(l===null?d.firstBaseUpdate=c:l.next=c,d.lastBaseUpdate=u))}if(s!==null){var p=i.baseState;o=0,d=c=u=null,l=s;do{var m=l.lane,w=l.eventTime;if((r&m)===m){d!==null&&(d=d.next={eventTime:w,lane:0,tag:l.tag,payload:l.payload,callback:l.callback,next:null});e:{var C=t,P=l;switch(m=e,w=n,P.tag){case 1:if(C=P.payload,typeof C=="function"){p=C.call(w,p,m);break e}p=C;break e;case 3:C.flags=C.flags&-65537|128;case 0:if(C=P.payload,m=typeof C=="function"?C.call(w,p,m):C,m==null)break e;p=Pe({},p,m);break e;case 2:fr=!0}}l.callback!==null&&l.lane!==0&&(t.flags|=64,m=i.effects,m===null?i.effects=[l]:m.push(l))}else w={eventTime:w,lane:m,tag:l.tag,payload:l.payload,callback:l.callback,next:null},d===null?(c=d=w,u=p):d=d.next=w,o|=m;if(l=l.next,l===null){if(l=i.shared.pending,l===null)break;m=l,l=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(!0);if(d===null&&(u=p),i.baseState=u,i.firstBaseUpdate=c,i.lastBaseUpdate=d,e=i.shared.interleaved,e!==null){i=e;do o|=i.lane,i=i.next;while(i!==e)}else s===null&&(i.shared.lanes=0);Pi|=o,t.lanes=o,t.memoizedState=p}}function Lv(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var r=t[e],i=r.callback;if(i!==null){if(r.callback=null,r=n,typeof i!="function")throw Error(U(191,i));i.call(r)}}}var rl={},vn=Yr(rl),Ca=Yr(rl),Pa=Yr(rl);function mi(t){if(t===rl)throw Error(U(174));return t}function pm(t,e){switch(me(Pa,e),me(Ca,t),me(vn,rl),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:gf(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=gf(e,t)}we(vn),me(vn,e)}function Vs(){we(vn),we(Ca),we(Pa)}function rT(t){mi(Pa.current);var e=mi(vn.current),n=gf(e,t.type);e!==n&&(me(Ca,t),me(vn,n))}function mm(t){Ca.current===t&&(we(vn),we(Ca))}var Ae=Yr(0);function tc(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Td=[];function gm(){for(var t=0;t<Td.length;t++)Td[t]._workInProgressVersionPrimary=null;Td.length=0}var vu=nr.ReactCurrentDispatcher,Sd=nr.ReactCurrentBatchConfig,Ci=0,Ce=null,Ue=null,ze=null,nc=!1,ra=!1,ka=0,Hk=0;function tt(){throw Error(U(321))}function ym(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!an(t[n],e[n]))return!1;return!0}function vm(t,e,n,r,i,s){if(Ci=s,Ce=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,vu.current=t===null||t.memoizedState===null?Kk:Qk,t=n(r,i),ra){s=0;do{if(ra=!1,ka=0,25<=s)throw Error(U(301));s+=1,ze=Ue=null,e.updateQueue=null,vu.current=Yk,t=n(r,i)}while(ra)}if(vu.current=rc,e=Ue!==null&&Ue.next!==null,Ci=0,ze=Ue=Ce=null,nc=!1,e)throw Error(U(300));return t}function _m(){var t=ka!==0;return ka=0,t}function fn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ze===null?Ce.memoizedState=ze=t:ze=ze.next=t,ze}function Gt(){if(Ue===null){var t=Ce.alternate;t=t!==null?t.memoizedState:null}else t=Ue.next;var e=ze===null?Ce.memoizedState:ze.next;if(e!==null)ze=e,Ue=t;else{if(t===null)throw Error(U(310));Ue=t,t={memoizedState:Ue.memoizedState,baseState:Ue.baseState,baseQueue:Ue.baseQueue,queue:Ue.queue,next:null},ze===null?Ce.memoizedState=ze=t:ze=ze.next=t}return ze}function Ra(t,e){return typeof e=="function"?e(t):e}function Ad(t){var e=Gt(),n=e.queue;if(n===null)throw Error(U(311));n.lastRenderedReducer=t;var r=Ue,i=r.baseQueue,s=n.pending;if(s!==null){if(i!==null){var o=i.next;i.next=s.next,s.next=o}r.baseQueue=i=s,n.pending=null}if(i!==null){s=i.next,r=r.baseState;var l=o=null,u=null,c=s;do{var d=c.lane;if((Ci&d)===d)u!==null&&(u=u.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),r=c.hasEagerState?c.eagerState:t(r,c.action);else{var p={lane:d,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};u===null?(l=u=p,o=r):u=u.next=p,Ce.lanes|=d,Pi|=d}c=c.next}while(c!==null&&c!==s);u===null?o=r:u.next=l,an(r,e.memoizedState)||(Et=!0),e.memoizedState=r,e.baseState=o,e.baseQueue=u,n.lastRenderedState=r}if(t=n.interleaved,t!==null){i=t;do s=i.lane,Ce.lanes|=s,Pi|=s,i=i.next;while(i!==t)}else i===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function Cd(t){var e=Gt(),n=e.queue;if(n===null)throw Error(U(311));n.lastRenderedReducer=t;var r=n.dispatch,i=n.pending,s=e.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do s=t(s,o.action),o=o.next;while(o!==i);an(s,e.memoizedState)||(Et=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,r]}function iT(){}function sT(t,e){var n=Ce,r=Gt(),i=e(),s=!an(r.memoizedState,i);if(s&&(r.memoizedState=i,Et=!0),r=r.queue,wm(lT.bind(null,n,r,t),[t]),r.getSnapshot!==e||s||ze!==null&&ze.memoizedState.tag&1){if(n.flags|=2048,ba(9,aT.bind(null,n,r,i,e),void 0,null),He===null)throw Error(U(349));Ci&30||oT(n,e,i)}return i}function oT(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=Ce.updateQueue,e===null?(e={lastEffect:null,stores:null},Ce.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function aT(t,e,n,r){e.value=n,e.getSnapshot=r,uT(e)&&cT(t)}function lT(t,e,n){return n(function(){uT(e)&&cT(t)})}function uT(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!an(t,n)}catch{return!0}}function cT(t){var e=Gn(t,1);e!==null&&rn(e,t,1,-1)}function Vv(t){var e=fn();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Ra,lastRenderedState:t},e.queue=t,t=t.dispatch=Gk.bind(null,Ce,t),[e.memoizedState,t]}function ba(t,e,n,r){return t={tag:t,create:e,destroy:n,deps:r,next:null},e=Ce.updateQueue,e===null?(e={lastEffect:null,stores:null},Ce.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t)),t}function hT(){return Gt().memoizedState}function _u(t,e,n,r){var i=fn();Ce.flags|=t,i.memoizedState=ba(1|e,n,void 0,r===void 0?null:r)}function Gc(t,e,n,r){var i=Gt();r=r===void 0?null:r;var s=void 0;if(Ue!==null){var o=Ue.memoizedState;if(s=o.destroy,r!==null&&ym(r,o.deps)){i.memoizedState=ba(e,n,s,r);return}}Ce.flags|=t,i.memoizedState=ba(1|e,n,s,r)}function Fv(t,e){return _u(8390656,8,t,e)}function wm(t,e){return Gc(2048,8,t,e)}function dT(t,e){return Gc(4,2,t,e)}function fT(t,e){return Gc(4,4,t,e)}function pT(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function mT(t,e,n){return n=n!=null?n.concat([t]):null,Gc(4,4,pT.bind(null,e,t),n)}function Em(){}function gT(t,e){var n=Gt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&ym(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function yT(t,e){var n=Gt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&ym(e,r[1])?r[0]:(t=t(),n.memoizedState=[t,e],t)}function vT(t,e,n){return Ci&21?(an(n,e)||(n=TI(),Ce.lanes|=n,Pi|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,Et=!0),t.memoizedState=n)}function Wk(t,e){var n=he;he=n!==0&&4>n?n:4,t(!0);var r=Sd.transition;Sd.transition={};try{t(!1),e()}finally{he=n,Sd.transition=r}}function _T(){return Gt().memoizedState}function qk(t,e,n){var r=Nr(t);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},wT(t))ET(e,n);else if(n=tT(t,e,n,r),n!==null){var i=pt();rn(n,t,r,i),IT(n,e,r)}}function Gk(t,e,n){var r=Nr(t),i={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(wT(t))ET(e,i);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,l=s(o,n);if(i.hasEagerState=!0,i.eagerState=l,an(l,o)){var u=e.interleaved;u===null?(i.next=i,dm(e)):(i.next=u.next,u.next=i),e.interleaved=i;return}}catch{}finally{}n=tT(t,e,i,r),n!==null&&(i=pt(),rn(n,t,r,i),IT(n,e,r))}}function wT(t){var e=t.alternate;return t===Ce||e!==null&&e===Ce}function ET(t,e){ra=nc=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function IT(t,e,n){if(n&4194240){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Xp(t,n)}}var rc={readContext:qt,useCallback:tt,useContext:tt,useEffect:tt,useImperativeHandle:tt,useInsertionEffect:tt,useLayoutEffect:tt,useMemo:tt,useReducer:tt,useRef:tt,useState:tt,useDebugValue:tt,useDeferredValue:tt,useTransition:tt,useMutableSource:tt,useSyncExternalStore:tt,useId:tt,unstable_isNewReconciler:!1},Kk={readContext:qt,useCallback:function(t,e){return fn().memoizedState=[t,e===void 0?null:e],t},useContext:qt,useEffect:Fv,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,_u(4194308,4,pT.bind(null,e,t),n)},useLayoutEffect:function(t,e){return _u(4194308,4,t,e)},useInsertionEffect:function(t,e){return _u(4,2,t,e)},useMemo:function(t,e){var n=fn();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var r=fn();return e=n!==void 0?n(e):e,r.memoizedState=r.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},r.queue=t,t=t.dispatch=qk.bind(null,Ce,t),[r.memoizedState,t]},useRef:function(t){var e=fn();return t={current:t},e.memoizedState=t},useState:Vv,useDebugValue:Em,useDeferredValue:function(t){return fn().memoizedState=t},useTransition:function(){var t=Vv(!1),e=t[0];return t=Wk.bind(null,t[1]),fn().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var r=Ce,i=fn();if(Ee){if(n===void 0)throw Error(U(407));n=n()}else{if(n=e(),He===null)throw Error(U(349));Ci&30||oT(r,e,n)}i.memoizedState=n;var s={value:n,getSnapshot:e};return i.queue=s,Fv(lT.bind(null,r,s,t),[t]),r.flags|=2048,ba(9,aT.bind(null,r,s,n,e),void 0,null),n},useId:function(){var t=fn(),e=He.identifierPrefix;if(Ee){var n=Vn,r=Ln;n=(r&~(1<<32-nn(r)-1)).toString(32)+n,e=":"+e+"R"+n,n=ka++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=Hk++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},Qk={readContext:qt,useCallback:gT,useContext:qt,useEffect:wm,useImperativeHandle:mT,useInsertionEffect:dT,useLayoutEffect:fT,useMemo:yT,useReducer:Ad,useRef:hT,useState:function(){return Ad(Ra)},useDebugValue:Em,useDeferredValue:function(t){var e=Gt();return vT(e,Ue.memoizedState,t)},useTransition:function(){var t=Ad(Ra)[0],e=Gt().memoizedState;return[t,e]},useMutableSource:iT,useSyncExternalStore:sT,useId:_T,unstable_isNewReconciler:!1},Yk={readContext:qt,useCallback:gT,useContext:qt,useEffect:wm,useImperativeHandle:mT,useInsertionEffect:dT,useLayoutEffect:fT,useMemo:yT,useReducer:Cd,useRef:hT,useState:function(){return Cd(Ra)},useDebugValue:Em,useDeferredValue:function(t){var e=Gt();return Ue===null?e.memoizedState=t:vT(e,Ue.memoizedState,t)},useTransition:function(){var t=Cd(Ra)[0],e=Gt().memoizedState;return[t,e]},useMutableSource:iT,useSyncExternalStore:sT,useId:_T,unstable_isNewReconciler:!1};function Zt(t,e){if(t&&t.defaultProps){e=Pe({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function Vf(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:Pe({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Kc={isMounted:function(t){return(t=t._reactInternals)?Fi(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var r=pt(),i=Nr(t),s=zn(r,i);s.payload=e,n!=null&&(s.callback=n),e=Rr(t,s,i),e!==null&&(rn(e,t,i,r),yu(e,t,i))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=pt(),i=Nr(t),s=zn(r,i);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=Rr(t,s,i),e!==null&&(rn(e,t,i,r),yu(e,t,i))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=pt(),r=Nr(t),i=zn(n,r);i.tag=2,e!=null&&(i.callback=e),e=Rr(t,i,r),e!==null&&(rn(e,t,r,n),yu(e,t,r))}};function Uv(t,e,n,r,i,s,o){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,s,o):e.prototype&&e.prototype.isPureReactComponent?!Ia(n,r)||!Ia(i,s):!0}function TT(t,e,n){var r=!1,i=jr,s=e.contextType;return typeof s=="object"&&s!==null?s=qt(s):(i=St(e)?Si:lt.current,r=e.contextTypes,s=(r=r!=null)?xs(t,i):jr),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Kc,t.stateNode=e,e._reactInternals=t,r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=i,t.__reactInternalMemoizedMaskedChildContext=s),e}function $v(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&Kc.enqueueReplaceState(e,e.state,null)}function Ff(t,e,n,r){var i=t.stateNode;i.props=n,i.state=t.memoizedState,i.refs={},fm(t);var s=e.contextType;typeof s=="object"&&s!==null?i.context=qt(s):(s=St(e)?Si:lt.current,i.context=xs(t,s)),i.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(Vf(t,e,s,n),i.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(e=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),e!==i.state&&Kc.enqueueReplaceState(i,i.state,null),ec(t,n,i,r),i.state=t.memoizedState),typeof i.componentDidMount=="function"&&(t.flags|=4194308)}function Fs(t,e){try{var n="",r=e;do n+=SP(r),r=r.return;while(r);var i=n}catch(s){i=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:i,digest:null}}function Pd(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function Uf(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var Jk=typeof WeakMap=="function"?WeakMap:Map;function ST(t,e,n){n=zn(-1,n),n.tag=3,n.payload={element:null};var r=e.value;return n.callback=function(){sc||(sc=!0,Qf=r),Uf(t,e)},n}function AT(t,e,n){n=zn(-1,n),n.tag=3;var r=t.type.getDerivedStateFromError;if(typeof r=="function"){var i=e.value;n.payload=function(){return r(i)},n.callback=function(){Uf(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){Uf(t,e),typeof r!="function"&&(br===null?br=new Set([this]):br.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),n}function jv(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new Jk;var i=new Set;r.set(e,i)}else i=r.get(e),i===void 0&&(i=new Set,r.set(e,i));i.has(n)||(i.add(n),t=hR.bind(null,t,e,n),e.then(t,t))}function Bv(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function zv(t,e,n,r,i){return t.mode&1?(t.flags|=65536,t.lanes=i,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=zn(-1,1),e.tag=2,Rr(n,e,1))),n.lanes|=1),t)}var Xk=nr.ReactCurrentOwner,Et=!1;function ft(t,e,n,r){e.child=t===null?eT(e,null,n,r):Ls(e,t.child,n,r)}function Hv(t,e,n,r,i){n=n.render;var s=e.ref;return Cs(e,i),r=vm(t,e,n,r,s,i),n=_m(),t!==null&&!Et?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Kn(t,e,i)):(Ee&&n&&om(e),e.flags|=1,ft(t,e,r,i),e.child)}function Wv(t,e,n,r,i){if(t===null){var s=n.type;return typeof s=="function"&&!Rm(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,CT(t,e,s,r,i)):(t=Tu(n.type,null,r,e,e.mode,i),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&i)){var o=s.memoizedProps;if(n=n.compare,n=n!==null?n:Ia,n(o,r)&&t.ref===e.ref)return Kn(t,e,i)}return e.flags|=1,t=Or(s,r),t.ref=e.ref,t.return=e,e.child=t}function CT(t,e,n,r,i){if(t!==null){var s=t.memoizedProps;if(Ia(s,r)&&t.ref===e.ref)if(Et=!1,e.pendingProps=r=s,(t.lanes&i)!==0)t.flags&131072&&(Et=!0);else return e.lanes=t.lanes,Kn(t,e,i)}return $f(t,e,n,r,i)}function PT(t,e,n){var r=e.pendingProps,i=r.children,s=t!==null?t.memoizedState:null;if(r.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},me(_s,bt),bt|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,me(_s,bt),bt|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=s!==null?s.baseLanes:n,me(_s,bt),bt|=r}else s!==null?(r=s.baseLanes|n,e.memoizedState=null):r=n,me(_s,bt),bt|=r;return ft(t,e,i,n),e.child}function kT(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function $f(t,e,n,r,i){var s=St(n)?Si:lt.current;return s=xs(e,s),Cs(e,i),n=vm(t,e,n,r,s,i),r=_m(),t!==null&&!Et?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Kn(t,e,i)):(Ee&&r&&om(e),e.flags|=1,ft(t,e,n,i),e.child)}function qv(t,e,n,r,i){if(St(n)){var s=!0;Qu(e)}else s=!1;if(Cs(e,i),e.stateNode===null)wu(t,e),TT(e,n,r),Ff(e,n,r,i),r=!0;else if(t===null){var o=e.stateNode,l=e.memoizedProps;o.props=l;var u=o.context,c=n.contextType;typeof c=="object"&&c!==null?c=qt(c):(c=St(n)?Si:lt.current,c=xs(e,c));var d=n.getDerivedStateFromProps,p=typeof d=="function"||typeof o.getSnapshotBeforeUpdate=="function";p||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==r||u!==c)&&$v(e,o,r,c),fr=!1;var m=e.memoizedState;o.state=m,ec(e,r,o,i),u=e.memoizedState,l!==r||m!==u||Tt.current||fr?(typeof d=="function"&&(Vf(e,n,d,r),u=e.memoizedState),(l=fr||Uv(e,n,l,r,m,u,c))?(p||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=u),o.props=r,o.state=u,o.context=c,r=l):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{o=e.stateNode,nT(t,e),l=e.memoizedProps,c=e.type===e.elementType?l:Zt(e.type,l),o.props=c,p=e.pendingProps,m=o.context,u=n.contextType,typeof u=="object"&&u!==null?u=qt(u):(u=St(n)?Si:lt.current,u=xs(e,u));var w=n.getDerivedStateFromProps;(d=typeof w=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==p||m!==u)&&$v(e,o,r,u),fr=!1,m=e.memoizedState,o.state=m,ec(e,r,o,i);var C=e.memoizedState;l!==p||m!==C||Tt.current||fr?(typeof w=="function"&&(Vf(e,n,w,r),C=e.memoizedState),(c=fr||Uv(e,n,c,r,m,C,u)||!1)?(d||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(r,C,u),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(r,C,u)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=C),o.props=r,o.state=C,o.context=u,r=c):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),r=!1)}return jf(t,e,n,r,s,i)}function jf(t,e,n,r,i,s){kT(t,e);var o=(e.flags&128)!==0;if(!r&&!o)return i&&Nv(e,n,!1),Kn(t,e,s);r=e.stateNode,Xk.current=e;var l=o&&typeof n.getDerivedStateFromError!="function"?null:r.render();return e.flags|=1,t!==null&&o?(e.child=Ls(e,t.child,null,s),e.child=Ls(e,null,l,s)):ft(t,e,l,s),e.memoizedState=r.state,i&&Nv(e,n,!0),e.child}function RT(t){var e=t.stateNode;e.pendingContext?bv(t,e.pendingContext,e.pendingContext!==e.context):e.context&&bv(t,e.context,!1),pm(t,e.containerInfo)}function Gv(t,e,n,r,i){return Ms(),lm(i),e.flags|=256,ft(t,e,n,r),e.child}var Bf={dehydrated:null,treeContext:null,retryLane:0};function zf(t){return{baseLanes:t,cachePool:null,transitions:null}}function bT(t,e,n){var r=e.pendingProps,i=Ae.current,s=!1,o=(e.flags&128)!==0,l;if((l=o)||(l=t!==null&&t.memoizedState===null?!1:(i&2)!==0),l?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(i|=1),me(Ae,i&1),t===null)return Mf(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(o=r.children,t=r.fallback,s?(r=e.mode,s=e.child,o={mode:"hidden",children:o},!(r&1)&&s!==null?(s.childLanes=0,s.pendingProps=o):s=Jc(o,r,0,null),t=wi(t,r,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=zf(n),e.memoizedState=Bf,t):Im(e,o));if(i=t.memoizedState,i!==null&&(l=i.dehydrated,l!==null))return Zk(t,e,o,r,l,i,n);if(s){s=r.fallback,o=e.mode,i=t.child,l=i.sibling;var u={mode:"hidden",children:r.children};return!(o&1)&&e.child!==i?(r=e.child,r.childLanes=0,r.pendingProps=u,e.deletions=null):(r=Or(i,u),r.subtreeFlags=i.subtreeFlags&14680064),l!==null?s=Or(l,s):(s=wi(s,o,n,null),s.flags|=2),s.return=e,r.return=e,r.sibling=s,e.child=r,r=s,s=e.child,o=t.child.memoizedState,o=o===null?zf(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=t.childLanes&~n,e.memoizedState=Bf,r}return s=t.child,t=s.sibling,r=Or(s,{mode:"visible",children:r.children}),!(e.mode&1)&&(r.lanes=n),r.return=e,r.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=r,e.memoizedState=null,r}function Im(t,e){return e=Jc({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function Zl(t,e,n,r){return r!==null&&lm(r),Ls(e,t.child,null,n),t=Im(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function Zk(t,e,n,r,i,s,o){if(n)return e.flags&256?(e.flags&=-257,r=Pd(Error(U(422))),Zl(t,e,o,r)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=r.fallback,i=e.mode,r=Jc({mode:"visible",children:r.children},i,0,null),s=wi(s,i,o,null),s.flags|=2,r.return=e,s.return=e,r.sibling=s,e.child=r,e.mode&1&&Ls(e,t.child,null,o),e.child.memoizedState=zf(o),e.memoizedState=Bf,s);if(!(e.mode&1))return Zl(t,e,o,null);if(i.data==="$!"){if(r=i.nextSibling&&i.nextSibling.dataset,r)var l=r.dgst;return r=l,s=Error(U(419)),r=Pd(s,r,void 0),Zl(t,e,o,r)}if(l=(o&t.childLanes)!==0,Et||l){if(r=He,r!==null){switch(o&-o){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=i&(r.suspendedLanes|o)?0:i,i!==0&&i!==s.retryLane&&(s.retryLane=i,Gn(t,i),rn(r,t,i,-1))}return km(),r=Pd(Error(U(421))),Zl(t,e,o,r)}return i.data==="$?"?(e.flags|=128,e.child=t.child,e=dR.bind(null,t),i._reactRetry=e,null):(t=s.treeContext,Nt=kr(i.nextSibling),Dt=e,Ee=!0,tn=null,t!==null&&($t[jt++]=Ln,$t[jt++]=Vn,$t[jt++]=Ai,Ln=t.id,Vn=t.overflow,Ai=e),e=Im(e,r.children),e.flags|=4096,e)}function Kv(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),Lf(t.return,e,n)}function kd(t,e,n,r,i){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=r,s.tail=n,s.tailMode=i)}function NT(t,e,n){var r=e.pendingProps,i=r.revealOrder,s=r.tail;if(ft(t,e,r.children,n),r=Ae.current,r&2)r=r&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Kv(t,n,e);else if(t.tag===19)Kv(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}r&=1}if(me(Ae,r),!(e.mode&1))e.memoizedState=null;else switch(i){case"forwards":for(n=e.child,i=null;n!==null;)t=n.alternate,t!==null&&tc(t)===null&&(i=n),n=n.sibling;n=i,n===null?(i=e.child,e.child=null):(i=n.sibling,n.sibling=null),kd(e,!1,i,n,s);break;case"backwards":for(n=null,i=e.child,e.child=null;i!==null;){if(t=i.alternate,t!==null&&tc(t)===null){e.child=i;break}t=i.sibling,i.sibling=n,n=i,i=t}kd(e,!0,n,null,s);break;case"together":kd(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function wu(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function Kn(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Pi|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(U(153));if(e.child!==null){for(t=e.child,n=Or(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Or(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function eR(t,e,n){switch(e.tag){case 3:RT(e),Ms();break;case 5:rT(e);break;case 1:St(e.type)&&Qu(e);break;case 4:pm(e,e.stateNode.containerInfo);break;case 10:var r=e.type._context,i=e.memoizedProps.value;me(Xu,r._currentValue),r._currentValue=i;break;case 13:if(r=e.memoizedState,r!==null)return r.dehydrated!==null?(me(Ae,Ae.current&1),e.flags|=128,null):n&e.child.childLanes?bT(t,e,n):(me(Ae,Ae.current&1),t=Kn(t,e,n),t!==null?t.sibling:null);me(Ae,Ae.current&1);break;case 19:if(r=(n&e.childLanes)!==0,t.flags&128){if(r)return NT(t,e,n);e.flags|=128}if(i=e.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),me(Ae,Ae.current),r)break;return null;case 22:case 23:return e.lanes=0,PT(t,e,n)}return Kn(t,e,n)}var OT,Hf,DT,xT;OT=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Hf=function(){};DT=function(t,e,n,r){var i=t.memoizedProps;if(i!==r){t=e.stateNode,mi(vn.current);var s=null;switch(n){case"input":i=df(t,i),r=df(t,r),s=[];break;case"select":i=Pe({},i,{value:void 0}),r=Pe({},r,{value:void 0}),s=[];break;case"textarea":i=mf(t,i),r=mf(t,r),s=[];break;default:typeof i.onClick!="function"&&typeof r.onClick=="function"&&(t.onclick=Gu)}yf(n,r);var o;n=null;for(c in i)if(!r.hasOwnProperty(c)&&i.hasOwnProperty(c)&&i[c]!=null)if(c==="style"){var l=i[c];for(o in l)l.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(ma.hasOwnProperty(c)?s||(s=[]):(s=s||[]).push(c,null));for(c in r){var u=r[c];if(l=i!=null?i[c]:void 0,r.hasOwnProperty(c)&&u!==l&&(u!=null||l!=null))if(c==="style")if(l){for(o in l)!l.hasOwnProperty(o)||u&&u.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in u)u.hasOwnProperty(o)&&l[o]!==u[o]&&(n||(n={}),n[o]=u[o])}else n||(s||(s=[]),s.push(c,n)),n=u;else c==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,l=l?l.__html:void 0,u!=null&&l!==u&&(s=s||[]).push(c,u)):c==="children"?typeof u!="string"&&typeof u!="number"||(s=s||[]).push(c,""+u):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(ma.hasOwnProperty(c)?(u!=null&&c==="onScroll"&&ve("scroll",t),s||l===u||(s=[])):(s=s||[]).push(c,u))}n&&(s=s||[]).push("style",n);var c=s;(e.updateQueue=c)&&(e.flags|=4)}};xT=function(t,e,n,r){n!==r&&(e.flags|=4)};function Do(t,e){if(!Ee)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function nt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=t,i=i.sibling;else for(i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=t,i=i.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function tR(t,e,n){var r=e.pendingProps;switch(am(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return nt(e),null;case 1:return St(e.type)&&Ku(),nt(e),null;case 3:return r=e.stateNode,Vs(),we(Tt),we(lt),gm(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(t===null||t.child===null)&&(Jl(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,tn!==null&&(Xf(tn),tn=null))),Hf(t,e),nt(e),null;case 5:mm(e);var i=mi(Pa.current);if(n=e.type,t!==null&&e.stateNode!=null)DT(t,e,n,r,i),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!r){if(e.stateNode===null)throw Error(U(166));return nt(e),null}if(t=mi(vn.current),Jl(e)){r=e.stateNode,n=e.type;var s=e.memoizedProps;switch(r[gn]=e,r[Aa]=s,t=(e.mode&1)!==0,n){case"dialog":ve("cancel",r),ve("close",r);break;case"iframe":case"object":case"embed":ve("load",r);break;case"video":case"audio":for(i=0;i<jo.length;i++)ve(jo[i],r);break;case"source":ve("error",r);break;case"img":case"image":case"link":ve("error",r),ve("load",r);break;case"details":ve("toggle",r);break;case"input":rv(r,s),ve("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!s.multiple},ve("invalid",r);break;case"textarea":sv(r,s),ve("invalid",r)}yf(n,s),i=null;for(var o in s)if(s.hasOwnProperty(o)){var l=s[o];o==="children"?typeof l=="string"?r.textContent!==l&&(s.suppressHydrationWarning!==!0&&Yl(r.textContent,l,t),i=["children",l]):typeof l=="number"&&r.textContent!==""+l&&(s.suppressHydrationWarning!==!0&&Yl(r.textContent,l,t),i=["children",""+l]):ma.hasOwnProperty(o)&&l!=null&&o==="onScroll"&&ve("scroll",r)}switch(n){case"input":Bl(r),iv(r,s,!0);break;case"textarea":Bl(r),ov(r);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(r.onclick=Gu)}r=i,e.updateQueue=r,r!==null&&(e.flags|=4)}else{o=i.nodeType===9?i:i.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=lI(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=o.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof r.is=="string"?t=o.createElement(n,{is:r.is}):(t=o.createElement(n),n==="select"&&(o=t,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):t=o.createElementNS(t,n),t[gn]=e,t[Aa]=r,OT(t,e,!1,!1),e.stateNode=t;e:{switch(o=vf(n,r),n){case"dialog":ve("cancel",t),ve("close",t),i=r;break;case"iframe":case"object":case"embed":ve("load",t),i=r;break;case"video":case"audio":for(i=0;i<jo.length;i++)ve(jo[i],t);i=r;break;case"source":ve("error",t),i=r;break;case"img":case"image":case"link":ve("error",t),ve("load",t),i=r;break;case"details":ve("toggle",t),i=r;break;case"input":rv(t,r),i=df(t,r),ve("invalid",t);break;case"option":i=r;break;case"select":t._wrapperState={wasMultiple:!!r.multiple},i=Pe({},r,{value:void 0}),ve("invalid",t);break;case"textarea":sv(t,r),i=mf(t,r),ve("invalid",t);break;default:i=r}yf(n,i),l=i;for(s in l)if(l.hasOwnProperty(s)){var u=l[s];s==="style"?hI(t,u):s==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&uI(t,u)):s==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&ga(t,u):typeof u=="number"&&ga(t,""+u):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(ma.hasOwnProperty(s)?u!=null&&s==="onScroll"&&ve("scroll",t):u!=null&&qp(t,s,u,o))}switch(n){case"input":Bl(t),iv(t,r,!1);break;case"textarea":Bl(t),ov(t);break;case"option":r.value!=null&&t.setAttribute("value",""+$r(r.value));break;case"select":t.multiple=!!r.multiple,s=r.value,s!=null?Is(t,!!r.multiple,s,!1):r.defaultValue!=null&&Is(t,!!r.multiple,r.defaultValue,!0);break;default:typeof i.onClick=="function"&&(t.onclick=Gu)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return nt(e),null;case 6:if(t&&e.stateNode!=null)xT(t,e,t.memoizedProps,r);else{if(typeof r!="string"&&e.stateNode===null)throw Error(U(166));if(n=mi(Pa.current),mi(vn.current),Jl(e)){if(r=e.stateNode,n=e.memoizedProps,r[gn]=e,(s=r.nodeValue!==n)&&(t=Dt,t!==null))switch(t.tag){case 3:Yl(r.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&Yl(r.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[gn]=e,e.stateNode=r}return nt(e),null;case 13:if(we(Ae),r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(Ee&&Nt!==null&&e.mode&1&&!(e.flags&128))XI(),Ms(),e.flags|=98560,s=!1;else if(s=Jl(e),r!==null&&r.dehydrated!==null){if(t===null){if(!s)throw Error(U(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(U(317));s[gn]=e}else Ms(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;nt(e),s=!1}else tn!==null&&(Xf(tn),tn=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(r=r!==null,r!==(t!==null&&t.memoizedState!==null)&&r&&(e.child.flags|=8192,e.mode&1&&(t===null||Ae.current&1?$e===0&&($e=3):km())),e.updateQueue!==null&&(e.flags|=4),nt(e),null);case 4:return Vs(),Hf(t,e),t===null&&Ta(e.stateNode.containerInfo),nt(e),null;case 10:return hm(e.type._context),nt(e),null;case 17:return St(e.type)&&Ku(),nt(e),null;case 19:if(we(Ae),s=e.memoizedState,s===null)return nt(e),null;if(r=(e.flags&128)!==0,o=s.rendering,o===null)if(r)Do(s,!1);else{if($e!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(o=tc(t),o!==null){for(e.flags|=128,Do(s,!1),r=o.updateQueue,r!==null&&(e.updateQueue=r,e.flags|=4),e.subtreeFlags=0,r=n,n=e.child;n!==null;)s=n,t=r,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,t=o.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return me(Ae,Ae.current&1|2),e.child}t=t.sibling}s.tail!==null&&De()>Us&&(e.flags|=128,r=!0,Do(s,!1),e.lanes=4194304)}else{if(!r)if(t=tc(o),t!==null){if(e.flags|=128,r=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),Do(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!Ee)return nt(e),null}else 2*De()-s.renderingStartTime>Us&&n!==1073741824&&(e.flags|=128,r=!0,Do(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(n=s.last,n!==null?n.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=De(),e.sibling=null,n=Ae.current,me(Ae,r?n&1|2:n&1),e):(nt(e),null);case 22:case 23:return Pm(),r=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==r&&(e.flags|=8192),r&&e.mode&1?bt&1073741824&&(nt(e),e.subtreeFlags&6&&(e.flags|=8192)):nt(e),null;case 24:return null;case 25:return null}throw Error(U(156,e.tag))}function nR(t,e){switch(am(e),e.tag){case 1:return St(e.type)&&Ku(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Vs(),we(Tt),we(lt),gm(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return mm(e),null;case 13:if(we(Ae),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(U(340));Ms()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return we(Ae),null;case 4:return Vs(),null;case 10:return hm(e.type._context),null;case 22:case 23:return Pm(),null;case 24:return null;default:return null}}var eu=!1,st=!1,rR=typeof WeakSet=="function"?WeakSet:Set,W=null;function vs(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){be(t,e,r)}else n.current=null}function Wf(t,e,n){try{n()}catch(r){be(t,e,r)}}var Qv=!1;function iR(t,e){if(kf=Hu,t=UI(),sm(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,s=r.focusNode;r=r.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var o=0,l=-1,u=-1,c=0,d=0,p=t,m=null;t:for(;;){for(var w;p!==n||i!==0&&p.nodeType!==3||(l=o+i),p!==s||r!==0&&p.nodeType!==3||(u=o+r),p.nodeType===3&&(o+=p.nodeValue.length),(w=p.firstChild)!==null;)m=p,p=w;for(;;){if(p===t)break t;if(m===n&&++c===i&&(l=o),m===s&&++d===r&&(u=o),(w=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=w}n=l===-1||u===-1?null:{start:l,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(Rf={focusedElem:t,selectionRange:n},Hu=!1,W=e;W!==null;)if(e=W,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,W=t;else for(;W!==null;){e=W;try{var C=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(C!==null){var P=C.memoizedProps,N=C.memoizedState,I=e.stateNode,y=I.getSnapshotBeforeUpdate(e.elementType===e.type?P:Zt(e.type,P),N);I.__reactInternalSnapshotBeforeUpdate=y}break;case 3:var S=e.stateNode.containerInfo;S.nodeType===1?S.textContent="":S.nodeType===9&&S.documentElement&&S.removeChild(S.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(U(163))}}catch(b){be(e,e.return,b)}if(t=e.sibling,t!==null){t.return=e.return,W=t;break}W=e.return}return C=Qv,Qv=!1,C}function ia(t,e,n){var r=e.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var i=r=r.next;do{if((i.tag&t)===t){var s=i.destroy;i.destroy=void 0,s!==void 0&&Wf(e,n,s)}i=i.next}while(i!==r)}}function Qc(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var r=n.create;n.destroy=r()}n=n.next}while(n!==e)}}function qf(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function MT(t){var e=t.alternate;e!==null&&(t.alternate=null,MT(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[gn],delete e[Aa],delete e[Of],delete e[$k],delete e[jk])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function LT(t){return t.tag===5||t.tag===3||t.tag===4}function Yv(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||LT(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Gf(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Gu));else if(r!==4&&(t=t.child,t!==null))for(Gf(t,e,n),t=t.sibling;t!==null;)Gf(t,e,n),t=t.sibling}function Kf(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(t=t.child,t!==null))for(Kf(t,e,n),t=t.sibling;t!==null;)Kf(t,e,n),t=t.sibling}var qe=null,en=!1;function lr(t,e,n){for(n=n.child;n!==null;)VT(t,e,n),n=n.sibling}function VT(t,e,n){if(yn&&typeof yn.onCommitFiberUnmount=="function")try{yn.onCommitFiberUnmount(jc,n)}catch{}switch(n.tag){case 5:st||vs(n,e);case 6:var r=qe,i=en;qe=null,lr(t,e,n),qe=r,en=i,qe!==null&&(en?(t=qe,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):qe.removeChild(n.stateNode));break;case 18:qe!==null&&(en?(t=qe,n=n.stateNode,t.nodeType===8?Ed(t.parentNode,n):t.nodeType===1&&Ed(t,n),wa(t)):Ed(qe,n.stateNode));break;case 4:r=qe,i=en,qe=n.stateNode.containerInfo,en=!0,lr(t,e,n),qe=r,en=i;break;case 0:case 11:case 14:case 15:if(!st&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var s=i,o=s.destroy;s=s.tag,o!==void 0&&(s&2||s&4)&&Wf(n,e,o),i=i.next}while(i!==r)}lr(t,e,n);break;case 1:if(!st&&(vs(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(l){be(n,e,l)}lr(t,e,n);break;case 21:lr(t,e,n);break;case 22:n.mode&1?(st=(r=st)||n.memoizedState!==null,lr(t,e,n),st=r):lr(t,e,n);break;default:lr(t,e,n)}}function Jv(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new rR),e.forEach(function(r){var i=fR.bind(null,t,r);n.has(r)||(n.add(r),r.then(i,i))})}}function Xt(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];try{var s=t,o=e,l=o;e:for(;l!==null;){switch(l.tag){case 5:qe=l.stateNode,en=!1;break e;case 3:qe=l.stateNode.containerInfo,en=!0;break e;case 4:qe=l.stateNode.containerInfo,en=!0;break e}l=l.return}if(qe===null)throw Error(U(160));VT(s,o,i),qe=null,en=!1;var u=i.alternate;u!==null&&(u.return=null),i.return=null}catch(c){be(i,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)FT(e,t),e=e.sibling}function FT(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(Xt(e,t),dn(t),r&4){try{ia(3,t,t.return),Qc(3,t)}catch(P){be(t,t.return,P)}try{ia(5,t,t.return)}catch(P){be(t,t.return,P)}}break;case 1:Xt(e,t),dn(t),r&512&&n!==null&&vs(n,n.return);break;case 5:if(Xt(e,t),dn(t),r&512&&n!==null&&vs(n,n.return),t.flags&32){var i=t.stateNode;try{ga(i,"")}catch(P){be(t,t.return,P)}}if(r&4&&(i=t.stateNode,i!=null)){var s=t.memoizedProps,o=n!==null?n.memoizedProps:s,l=t.type,u=t.updateQueue;if(t.updateQueue=null,u!==null)try{l==="input"&&s.type==="radio"&&s.name!=null&&oI(i,s),vf(l,o);var c=vf(l,s);for(o=0;o<u.length;o+=2){var d=u[o],p=u[o+1];d==="style"?hI(i,p):d==="dangerouslySetInnerHTML"?uI(i,p):d==="children"?ga(i,p):qp(i,d,p,c)}switch(l){case"input":ff(i,s);break;case"textarea":aI(i,s);break;case"select":var m=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!s.multiple;var w=s.value;w!=null?Is(i,!!s.multiple,w,!1):m!==!!s.multiple&&(s.defaultValue!=null?Is(i,!!s.multiple,s.defaultValue,!0):Is(i,!!s.multiple,s.multiple?[]:"",!1))}i[Aa]=s}catch(P){be(t,t.return,P)}}break;case 6:if(Xt(e,t),dn(t),r&4){if(t.stateNode===null)throw Error(U(162));i=t.stateNode,s=t.memoizedProps;try{i.nodeValue=s}catch(P){be(t,t.return,P)}}break;case 3:if(Xt(e,t),dn(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{wa(e.containerInfo)}catch(P){be(t,t.return,P)}break;case 4:Xt(e,t),dn(t);break;case 13:Xt(e,t),dn(t),i=t.child,i.flags&8192&&(s=i.memoizedState!==null,i.stateNode.isHidden=s,!s||i.alternate!==null&&i.alternate.memoizedState!==null||(Am=De())),r&4&&Jv(t);break;case 22:if(d=n!==null&&n.memoizedState!==null,t.mode&1?(st=(c=st)||d,Xt(e,t),st=c):Xt(e,t),dn(t),r&8192){if(c=t.memoizedState!==null,(t.stateNode.isHidden=c)&&!d&&t.mode&1)for(W=t,d=t.child;d!==null;){for(p=W=d;W!==null;){switch(m=W,w=m.child,m.tag){case 0:case 11:case 14:case 15:ia(4,m,m.return);break;case 1:vs(m,m.return);var C=m.stateNode;if(typeof C.componentWillUnmount=="function"){r=m,n=m.return;try{e=r,C.props=e.memoizedProps,C.state=e.memoizedState,C.componentWillUnmount()}catch(P){be(r,n,P)}}break;case 5:vs(m,m.return);break;case 22:if(m.memoizedState!==null){Zv(p);continue}}w!==null?(w.return=m,W=w):Zv(p)}d=d.sibling}e:for(d=null,p=t;;){if(p.tag===5){if(d===null){d=p;try{i=p.stateNode,c?(s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(l=p.stateNode,u=p.memoizedProps.style,o=u!=null&&u.hasOwnProperty("display")?u.display:null,l.style.display=cI("display",o))}catch(P){be(t,t.return,P)}}}else if(p.tag===6){if(d===null)try{p.stateNode.nodeValue=c?"":p.memoizedProps}catch(P){be(t,t.return,P)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===t)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===t)break e;for(;p.sibling===null;){if(p.return===null||p.return===t)break e;d===p&&(d=null),p=p.return}d===p&&(d=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:Xt(e,t),dn(t),r&4&&Jv(t);break;case 21:break;default:Xt(e,t),dn(t)}}function dn(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(LT(n)){var r=n;break e}n=n.return}throw Error(U(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(ga(i,""),r.flags&=-33);var s=Yv(t);Kf(t,s,i);break;case 3:case 4:var o=r.stateNode.containerInfo,l=Yv(t);Gf(t,l,o);break;default:throw Error(U(161))}}catch(u){be(t,t.return,u)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function sR(t,e,n){W=t,UT(t)}function UT(t,e,n){for(var r=(t.mode&1)!==0;W!==null;){var i=W,s=i.child;if(i.tag===22&&r){var o=i.memoizedState!==null||eu;if(!o){var l=i.alternate,u=l!==null&&l.memoizedState!==null||st;l=eu;var c=st;if(eu=o,(st=u)&&!c)for(W=i;W!==null;)o=W,u=o.child,o.tag===22&&o.memoizedState!==null?e_(i):u!==null?(u.return=o,W=u):e_(i);for(;s!==null;)W=s,UT(s),s=s.sibling;W=i,eu=l,st=c}Xv(t)}else i.subtreeFlags&8772&&s!==null?(s.return=i,W=s):Xv(t)}}function Xv(t){for(;W!==null;){var e=W;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:st||Qc(5,e);break;case 1:var r=e.stateNode;if(e.flags&4&&!st)if(n===null)r.componentDidMount();else{var i=e.elementType===e.type?n.memoizedProps:Zt(e.type,n.memoizedProps);r.componentDidUpdate(i,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&Lv(e,s,r);break;case 3:var o=e.updateQueue;if(o!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}Lv(e,o,n)}break;case 5:var l=e.stateNode;if(n===null&&e.flags&4){n=l;var u=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var d=c.memoizedState;if(d!==null){var p=d.dehydrated;p!==null&&wa(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(U(163))}st||e.flags&512&&qf(e)}catch(m){be(e,e.return,m)}}if(e===t){W=null;break}if(n=e.sibling,n!==null){n.return=e.return,W=n;break}W=e.return}}function Zv(t){for(;W!==null;){var e=W;if(e===t){W=null;break}var n=e.sibling;if(n!==null){n.return=e.return,W=n;break}W=e.return}}function e_(t){for(;W!==null;){var e=W;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{Qc(4,e)}catch(u){be(e,n,u)}break;case 1:var r=e.stateNode;if(typeof r.componentDidMount=="function"){var i=e.return;try{r.componentDidMount()}catch(u){be(e,i,u)}}var s=e.return;try{qf(e)}catch(u){be(e,s,u)}break;case 5:var o=e.return;try{qf(e)}catch(u){be(e,o,u)}}}catch(u){be(e,e.return,u)}if(e===t){W=null;break}var l=e.sibling;if(l!==null){l.return=e.return,W=l;break}W=e.return}}var oR=Math.ceil,ic=nr.ReactCurrentDispatcher,Tm=nr.ReactCurrentOwner,Wt=nr.ReactCurrentBatchConfig,ae=0,He=null,Le=null,Qe=0,bt=0,_s=Yr(0),$e=0,Na=null,Pi=0,Yc=0,Sm=0,sa=null,_t=null,Am=0,Us=1/0,On=null,sc=!1,Qf=null,br=null,tu=!1,Er=null,oc=0,oa=0,Yf=null,Eu=-1,Iu=0;function pt(){return ae&6?De():Eu!==-1?Eu:Eu=De()}function Nr(t){return t.mode&1?ae&2&&Qe!==0?Qe&-Qe:zk.transition!==null?(Iu===0&&(Iu=TI()),Iu):(t=he,t!==0||(t=window.event,t=t===void 0?16:bI(t.type)),t):1}function rn(t,e,n,r){if(50<oa)throw oa=0,Yf=null,Error(U(185));el(t,n,r),(!(ae&2)||t!==He)&&(t===He&&(!(ae&2)&&(Yc|=n),$e===4&&mr(t,Qe)),At(t,r),n===1&&ae===0&&!(e.mode&1)&&(Us=De()+500,qc&&Jr()))}function At(t,e){var n=t.callbackNode;zP(t,e);var r=zu(t,t===He?Qe:0);if(r===0)n!==null&&uv(n),t.callbackNode=null,t.callbackPriority=0;else if(e=r&-r,t.callbackPriority!==e){if(n!=null&&uv(n),e===1)t.tag===0?Bk(t_.bind(null,t)):QI(t_.bind(null,t)),Fk(function(){!(ae&6)&&Jr()}),n=null;else{switch(SI(r)){case 1:n=Jp;break;case 4:n=EI;break;case 16:n=Bu;break;case 536870912:n=II;break;default:n=Bu}n=GT(n,$T.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function $T(t,e){if(Eu=-1,Iu=0,ae&6)throw Error(U(327));var n=t.callbackNode;if(Ps()&&t.callbackNode!==n)return null;var r=zu(t,t===He?Qe:0);if(r===0)return null;if(r&30||r&t.expiredLanes||e)e=ac(t,r);else{e=r;var i=ae;ae|=2;var s=BT();(He!==t||Qe!==e)&&(On=null,Us=De()+500,_i(t,e));do try{uR();break}catch(l){jT(t,l)}while(!0);cm(),ic.current=s,ae=i,Le!==null?e=0:(He=null,Qe=0,e=$e)}if(e!==0){if(e===2&&(i=Tf(t),i!==0&&(r=i,e=Jf(t,i))),e===1)throw n=Na,_i(t,0),mr(t,r),At(t,De()),n;if(e===6)mr(t,r);else{if(i=t.current.alternate,!(r&30)&&!aR(i)&&(e=ac(t,r),e===2&&(s=Tf(t),s!==0&&(r=s,e=Jf(t,s))),e===1))throw n=Na,_i(t,0),mr(t,r),At(t,De()),n;switch(t.finishedWork=i,t.finishedLanes=r,e){case 0:case 1:throw Error(U(345));case 2:ui(t,_t,On);break;case 3:if(mr(t,r),(r&130023424)===r&&(e=Am+500-De(),10<e)){if(zu(t,0)!==0)break;if(i=t.suspendedLanes,(i&r)!==r){pt(),t.pingedLanes|=t.suspendedLanes&i;break}t.timeoutHandle=Nf(ui.bind(null,t,_t,On),e);break}ui(t,_t,On);break;case 4:if(mr(t,r),(r&4194240)===r)break;for(e=t.eventTimes,i=-1;0<r;){var o=31-nn(r);s=1<<o,o=e[o],o>i&&(i=o),r&=~s}if(r=i,r=De()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*oR(r/1960))-r,10<r){t.timeoutHandle=Nf(ui.bind(null,t,_t,On),r);break}ui(t,_t,On);break;case 5:ui(t,_t,On);break;default:throw Error(U(329))}}}return At(t,De()),t.callbackNode===n?$T.bind(null,t):null}function Jf(t,e){var n=sa;return t.current.memoizedState.isDehydrated&&(_i(t,e).flags|=256),t=ac(t,e),t!==2&&(e=_t,_t=n,e!==null&&Xf(e)),t}function Xf(t){_t===null?_t=t:_t.push.apply(_t,t)}function aR(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var i=n[r],s=i.getSnapshot;i=i.value;try{if(!an(s(),i))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function mr(t,e){for(e&=~Sm,e&=~Yc,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-nn(e),r=1<<n;t[n]=-1,e&=~r}}function t_(t){if(ae&6)throw Error(U(327));Ps();var e=zu(t,0);if(!(e&1))return At(t,De()),null;var n=ac(t,e);if(t.tag!==0&&n===2){var r=Tf(t);r!==0&&(e=r,n=Jf(t,r))}if(n===1)throw n=Na,_i(t,0),mr(t,e),At(t,De()),n;if(n===6)throw Error(U(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,ui(t,_t,On),At(t,De()),null}function Cm(t,e){var n=ae;ae|=1;try{return t(e)}finally{ae=n,ae===0&&(Us=De()+500,qc&&Jr())}}function ki(t){Er!==null&&Er.tag===0&&!(ae&6)&&Ps();var e=ae;ae|=1;var n=Wt.transition,r=he;try{if(Wt.transition=null,he=1,t)return t()}finally{he=r,Wt.transition=n,ae=e,!(ae&6)&&Jr()}}function Pm(){bt=_s.current,we(_s)}function _i(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,Vk(n)),Le!==null)for(n=Le.return;n!==null;){var r=n;switch(am(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&Ku();break;case 3:Vs(),we(Tt),we(lt),gm();break;case 5:mm(r);break;case 4:Vs();break;case 13:we(Ae);break;case 19:we(Ae);break;case 10:hm(r.type._context);break;case 22:case 23:Pm()}n=n.return}if(He=t,Le=t=Or(t.current,null),Qe=bt=e,$e=0,Na=null,Sm=Yc=Pi=0,_t=sa=null,pi!==null){for(e=0;e<pi.length;e++)if(n=pi[e],r=n.interleaved,r!==null){n.interleaved=null;var i=r.next,s=n.pending;if(s!==null){var o=s.next;s.next=i,r.next=o}n.pending=r}pi=null}return t}function jT(t,e){do{var n=Le;try{if(cm(),vu.current=rc,nc){for(var r=Ce.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}nc=!1}if(Ci=0,ze=Ue=Ce=null,ra=!1,ka=0,Tm.current=null,n===null||n.return===null){$e=1,Na=e,Le=null;break}e:{var s=t,o=n.return,l=n,u=e;if(e=Qe,l.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var c=u,d=l,p=d.tag;if(!(d.mode&1)&&(p===0||p===11||p===15)){var m=d.alternate;m?(d.updateQueue=m.updateQueue,d.memoizedState=m.memoizedState,d.lanes=m.lanes):(d.updateQueue=null,d.memoizedState=null)}var w=Bv(o);if(w!==null){w.flags&=-257,zv(w,o,l,s,e),w.mode&1&&jv(s,c,e),e=w,u=c;var C=e.updateQueue;if(C===null){var P=new Set;P.add(u),e.updateQueue=P}else C.add(u);break e}else{if(!(e&1)){jv(s,c,e),km();break e}u=Error(U(426))}}else if(Ee&&l.mode&1){var N=Bv(o);if(N!==null){!(N.flags&65536)&&(N.flags|=256),zv(N,o,l,s,e),lm(Fs(u,l));break e}}s=u=Fs(u,l),$e!==4&&($e=2),sa===null?sa=[s]:sa.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var I=ST(s,u,e);Mv(s,I);break e;case 1:l=u;var y=s.type,S=s.stateNode;if(!(s.flags&128)&&(typeof y.getDerivedStateFromError=="function"||S!==null&&typeof S.componentDidCatch=="function"&&(br===null||!br.has(S)))){s.flags|=65536,e&=-e,s.lanes|=e;var b=AT(s,l,e);Mv(s,b);break e}}s=s.return}while(s!==null)}HT(n)}catch(F){e=F,Le===n&&n!==null&&(Le=n=n.return);continue}break}while(!0)}function BT(){var t=ic.current;return ic.current=rc,t===null?rc:t}function km(){($e===0||$e===3||$e===2)&&($e=4),He===null||!(Pi&268435455)&&!(Yc&268435455)||mr(He,Qe)}function ac(t,e){var n=ae;ae|=2;var r=BT();(He!==t||Qe!==e)&&(On=null,_i(t,e));do try{lR();break}catch(i){jT(t,i)}while(!0);if(cm(),ae=n,ic.current=r,Le!==null)throw Error(U(261));return He=null,Qe=0,$e}function lR(){for(;Le!==null;)zT(Le)}function uR(){for(;Le!==null&&!xP();)zT(Le)}function zT(t){var e=qT(t.alternate,t,bt);t.memoizedProps=t.pendingProps,e===null?HT(t):Le=e,Tm.current=null}function HT(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=nR(n,e),n!==null){n.flags&=32767,Le=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{$e=6,Le=null;return}}else if(n=tR(n,e,bt),n!==null){Le=n;return}if(e=e.sibling,e!==null){Le=e;return}Le=e=t}while(e!==null);$e===0&&($e=5)}function ui(t,e,n){var r=he,i=Wt.transition;try{Wt.transition=null,he=1,cR(t,e,n,r)}finally{Wt.transition=i,he=r}return null}function cR(t,e,n,r){do Ps();while(Er!==null);if(ae&6)throw Error(U(327));n=t.finishedWork;var i=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(U(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(HP(t,s),t===He&&(Le=He=null,Qe=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||tu||(tu=!0,GT(Bu,function(){return Ps(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=Wt.transition,Wt.transition=null;var o=he;he=1;var l=ae;ae|=4,Tm.current=null,iR(t,n),FT(n,t),bk(Rf),Hu=!!kf,Rf=kf=null,t.current=n,sR(n),MP(),ae=l,he=o,Wt.transition=s}else t.current=n;if(tu&&(tu=!1,Er=t,oc=i),s=t.pendingLanes,s===0&&(br=null),FP(n.stateNode),At(t,De()),e!==null)for(r=t.onRecoverableError,n=0;n<e.length;n++)i=e[n],r(i.value,{componentStack:i.stack,digest:i.digest});if(sc)throw sc=!1,t=Qf,Qf=null,t;return oc&1&&t.tag!==0&&Ps(),s=t.pendingLanes,s&1?t===Yf?oa++:(oa=0,Yf=t):oa=0,Jr(),null}function Ps(){if(Er!==null){var t=SI(oc),e=Wt.transition,n=he;try{if(Wt.transition=null,he=16>t?16:t,Er===null)var r=!1;else{if(t=Er,Er=null,oc=0,ae&6)throw Error(U(331));var i=ae;for(ae|=4,W=t.current;W!==null;){var s=W,o=s.child;if(W.flags&16){var l=s.deletions;if(l!==null){for(var u=0;u<l.length;u++){var c=l[u];for(W=c;W!==null;){var d=W;switch(d.tag){case 0:case 11:case 15:ia(8,d,s)}var p=d.child;if(p!==null)p.return=d,W=p;else for(;W!==null;){d=W;var m=d.sibling,w=d.return;if(MT(d),d===c){W=null;break}if(m!==null){m.return=w,W=m;break}W=w}}}var C=s.alternate;if(C!==null){var P=C.child;if(P!==null){C.child=null;do{var N=P.sibling;P.sibling=null,P=N}while(P!==null)}}W=s}}if(s.subtreeFlags&2064&&o!==null)o.return=s,W=o;else e:for(;W!==null;){if(s=W,s.flags&2048)switch(s.tag){case 0:case 11:case 15:ia(9,s,s.return)}var I=s.sibling;if(I!==null){I.return=s.return,W=I;break e}W=s.return}}var y=t.current;for(W=y;W!==null;){o=W;var S=o.child;if(o.subtreeFlags&2064&&S!==null)S.return=o,W=S;else e:for(o=y;W!==null;){if(l=W,l.flags&2048)try{switch(l.tag){case 0:case 11:case 15:Qc(9,l)}}catch(F){be(l,l.return,F)}if(l===o){W=null;break e}var b=l.sibling;if(b!==null){b.return=l.return,W=b;break e}W=l.return}}if(ae=i,Jr(),yn&&typeof yn.onPostCommitFiberRoot=="function")try{yn.onPostCommitFiberRoot(jc,t)}catch{}r=!0}return r}finally{he=n,Wt.transition=e}}return!1}function n_(t,e,n){e=Fs(n,e),e=ST(t,e,1),t=Rr(t,e,1),e=pt(),t!==null&&(el(t,1,e),At(t,e))}function be(t,e,n){if(t.tag===3)n_(t,t,n);else for(;e!==null;){if(e.tag===3){n_(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(br===null||!br.has(r))){t=Fs(n,t),t=AT(e,t,1),e=Rr(e,t,1),t=pt(),e!==null&&(el(e,1,t),At(e,t));break}}e=e.return}}function hR(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),e=pt(),t.pingedLanes|=t.suspendedLanes&n,He===t&&(Qe&n)===n&&($e===4||$e===3&&(Qe&130023424)===Qe&&500>De()-Am?_i(t,0):Sm|=n),At(t,e)}function WT(t,e){e===0&&(t.mode&1?(e=Wl,Wl<<=1,!(Wl&130023424)&&(Wl=4194304)):e=1);var n=pt();t=Gn(t,e),t!==null&&(el(t,e,n),At(t,n))}function dR(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),WT(t,n)}function fR(t,e){var n=0;switch(t.tag){case 13:var r=t.stateNode,i=t.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=t.stateNode;break;default:throw Error(U(314))}r!==null&&r.delete(e),WT(t,n)}var qT;qT=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||Tt.current)Et=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return Et=!1,eR(t,e,n);Et=!!(t.flags&131072)}else Et=!1,Ee&&e.flags&1048576&&YI(e,Ju,e.index);switch(e.lanes=0,e.tag){case 2:var r=e.type;wu(t,e),t=e.pendingProps;var i=xs(e,lt.current);Cs(e,n),i=vm(null,e,r,t,i,n);var s=_m();return e.flags|=1,typeof i=="object"&&i!==null&&typeof i.render=="function"&&i.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,St(r)?(s=!0,Qu(e)):s=!1,e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,fm(e),i.updater=Kc,e.stateNode=i,i._reactInternals=e,Ff(e,r,t,n),e=jf(null,e,r,!0,s,n)):(e.tag=0,Ee&&s&&om(e),ft(null,e,i,n),e=e.child),e;case 16:r=e.elementType;e:{switch(wu(t,e),t=e.pendingProps,i=r._init,r=i(r._payload),e.type=r,i=e.tag=mR(r),t=Zt(r,t),i){case 0:e=$f(null,e,r,t,n);break e;case 1:e=qv(null,e,r,t,n);break e;case 11:e=Hv(null,e,r,t,n);break e;case 14:e=Wv(null,e,r,Zt(r.type,t),n);break e}throw Error(U(306,r,""))}return e;case 0:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Zt(r,i),$f(t,e,r,i,n);case 1:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Zt(r,i),qv(t,e,r,i,n);case 3:e:{if(RT(e),t===null)throw Error(U(387));r=e.pendingProps,s=e.memoizedState,i=s.element,nT(t,e),ec(e,r,null,n);var o=e.memoizedState;if(r=o.element,s.isDehydrated)if(s={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){i=Fs(Error(U(423)),e),e=Gv(t,e,r,n,i);break e}else if(r!==i){i=Fs(Error(U(424)),e),e=Gv(t,e,r,n,i);break e}else for(Nt=kr(e.stateNode.containerInfo.firstChild),Dt=e,Ee=!0,tn=null,n=eT(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Ms(),r===i){e=Kn(t,e,n);break e}ft(t,e,r,n)}e=e.child}return e;case 5:return rT(e),t===null&&Mf(e),r=e.type,i=e.pendingProps,s=t!==null?t.memoizedProps:null,o=i.children,bf(r,i)?o=null:s!==null&&bf(r,s)&&(e.flags|=32),kT(t,e),ft(t,e,o,n),e.child;case 6:return t===null&&Mf(e),null;case 13:return bT(t,e,n);case 4:return pm(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=Ls(e,null,r,n):ft(t,e,r,n),e.child;case 11:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Zt(r,i),Hv(t,e,r,i,n);case 7:return ft(t,e,e.pendingProps,n),e.child;case 8:return ft(t,e,e.pendingProps.children,n),e.child;case 12:return ft(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(r=e.type._context,i=e.pendingProps,s=e.memoizedProps,o=i.value,me(Xu,r._currentValue),r._currentValue=o,s!==null)if(an(s.value,o)){if(s.children===i.children&&!Tt.current){e=Kn(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var l=s.dependencies;if(l!==null){o=s.child;for(var u=l.firstContext;u!==null;){if(u.context===r){if(s.tag===1){u=zn(-1,n&-n),u.tag=2;var c=s.updateQueue;if(c!==null){c=c.shared;var d=c.pending;d===null?u.next=u:(u.next=d.next,d.next=u),c.pending=u}}s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),Lf(s.return,n,e),l.lanes|=n;break}u=u.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(U(341));o.lanes|=n,l=o.alternate,l!==null&&(l.lanes|=n),Lf(o,n,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}ft(t,e,i.children,n),e=e.child}return e;case 9:return i=e.type,r=e.pendingProps.children,Cs(e,n),i=qt(i),r=r(i),e.flags|=1,ft(t,e,r,n),e.child;case 14:return r=e.type,i=Zt(r,e.pendingProps),i=Zt(r.type,i),Wv(t,e,r,i,n);case 15:return CT(t,e,e.type,e.pendingProps,n);case 17:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Zt(r,i),wu(t,e),e.tag=1,St(r)?(t=!0,Qu(e)):t=!1,Cs(e,n),TT(e,r,i),Ff(e,r,i,n),jf(null,e,r,!0,t,n);case 19:return NT(t,e,n);case 22:return PT(t,e,n)}throw Error(U(156,e.tag))};function GT(t,e){return wI(t,e)}function pR(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ht(t,e,n,r){return new pR(t,e,n,r)}function Rm(t){return t=t.prototype,!(!t||!t.isReactComponent)}function mR(t){if(typeof t=="function")return Rm(t)?1:0;if(t!=null){if(t=t.$$typeof,t===Kp)return 11;if(t===Qp)return 14}return 2}function Or(t,e){var n=t.alternate;return n===null?(n=Ht(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function Tu(t,e,n,r,i,s){var o=2;if(r=t,typeof t=="function")Rm(t)&&(o=1);else if(typeof t=="string")o=5;else e:switch(t){case us:return wi(n.children,i,s,e);case Gp:o=8,i|=8;break;case lf:return t=Ht(12,n,e,i|2),t.elementType=lf,t.lanes=s,t;case uf:return t=Ht(13,n,e,i),t.elementType=uf,t.lanes=s,t;case cf:return t=Ht(19,n,e,i),t.elementType=cf,t.lanes=s,t;case rI:return Jc(n,i,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case tI:o=10;break e;case nI:o=9;break e;case Kp:o=11;break e;case Qp:o=14;break e;case dr:o=16,r=null;break e}throw Error(U(130,t==null?t:typeof t,""))}return e=Ht(o,n,e,i),e.elementType=t,e.type=r,e.lanes=s,e}function wi(t,e,n,r){return t=Ht(7,t,r,e),t.lanes=n,t}function Jc(t,e,n,r){return t=Ht(22,t,r,e),t.elementType=rI,t.lanes=n,t.stateNode={isHidden:!1},t}function Rd(t,e,n){return t=Ht(6,t,null,e),t.lanes=n,t}function bd(t,e,n){return e=Ht(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function gR(t,e,n,r,i){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=cd(0),this.expirationTimes=cd(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=cd(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function bm(t,e,n,r,i,s,o,l,u){return t=new gR(t,e,n,l,u),e===1?(e=1,s===!0&&(e|=8)):e=0,s=Ht(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},fm(s),t}function yR(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ls,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}function KT(t){if(!t)return jr;t=t._reactInternals;e:{if(Fi(t)!==t||t.tag!==1)throw Error(U(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(St(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(U(171))}if(t.tag===1){var n=t.type;if(St(n))return KI(t,n,e)}return e}function QT(t,e,n,r,i,s,o,l,u){return t=bm(n,r,!0,t,i,s,o,l,u),t.context=KT(null),n=t.current,r=pt(),i=Nr(n),s=zn(r,i),s.callback=e??null,Rr(n,s,i),t.current.lanes=i,el(t,i,r),At(t,r),t}function Xc(t,e,n,r){var i=e.current,s=pt(),o=Nr(i);return n=KT(n),e.context===null?e.context=n:e.pendingContext=n,e=zn(s,o),e.payload={element:t},r=r===void 0?null:r,r!==null&&(e.callback=r),t=Rr(i,e,o),t!==null&&(rn(t,i,o,s),yu(t,i,o)),o}function lc(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function r_(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Nm(t,e){r_(t,e),(t=t.alternate)&&r_(t,e)}function vR(){return null}var YT=typeof reportError=="function"?reportError:function(t){console.error(t)};function Om(t){this._internalRoot=t}Zc.prototype.render=Om.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(U(409));Xc(t,e,null,null)};Zc.prototype.unmount=Om.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;ki(function(){Xc(null,t,null,null)}),e[qn]=null}};function Zc(t){this._internalRoot=t}Zc.prototype.unstable_scheduleHydration=function(t){if(t){var e=PI();t={blockedOn:null,target:t,priority:e};for(var n=0;n<pr.length&&e!==0&&e<pr[n].priority;n++);pr.splice(n,0,t),n===0&&RI(t)}};function Dm(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function eh(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function i_(){}function _R(t,e,n,r,i){if(i){if(typeof r=="function"){var s=r;r=function(){var c=lc(o);s.call(c)}}var o=QT(e,r,t,0,null,!1,!1,"",i_);return t._reactRootContainer=o,t[qn]=o.current,Ta(t.nodeType===8?t.parentNode:t),ki(),o}for(;i=t.lastChild;)t.removeChild(i);if(typeof r=="function"){var l=r;r=function(){var c=lc(u);l.call(c)}}var u=bm(t,0,!1,null,null,!1,!1,"",i_);return t._reactRootContainer=u,t[qn]=u.current,Ta(t.nodeType===8?t.parentNode:t),ki(function(){Xc(e,u,n,r)}),u}function th(t,e,n,r,i){var s=n._reactRootContainer;if(s){var o=s;if(typeof i=="function"){var l=i;i=function(){var u=lc(o);l.call(u)}}Xc(e,o,t,i)}else o=_R(n,e,t,i,r);return lc(o)}AI=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=$o(e.pendingLanes);n!==0&&(Xp(e,n|1),At(e,De()),!(ae&6)&&(Us=De()+500,Jr()))}break;case 13:ki(function(){var r=Gn(t,1);if(r!==null){var i=pt();rn(r,t,1,i)}}),Nm(t,1)}};Zp=function(t){if(t.tag===13){var e=Gn(t,134217728);if(e!==null){var n=pt();rn(e,t,134217728,n)}Nm(t,134217728)}};CI=function(t){if(t.tag===13){var e=Nr(t),n=Gn(t,e);if(n!==null){var r=pt();rn(n,t,e,r)}Nm(t,e)}};PI=function(){return he};kI=function(t,e){var n=he;try{return he=t,e()}finally{he=n}};wf=function(t,e,n){switch(e){case"input":if(ff(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var i=Wc(r);if(!i)throw Error(U(90));sI(r),ff(r,i)}}}break;case"textarea":aI(t,n);break;case"select":e=n.value,e!=null&&Is(t,!!n.multiple,e,!1)}};pI=Cm;mI=ki;var wR={usingClientEntryPoint:!1,Events:[nl,fs,Wc,dI,fI,Cm]},xo={findFiberByHostInstance:fi,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},ER={bundleType:xo.bundleType,version:xo.version,rendererPackageName:xo.rendererPackageName,rendererConfig:xo.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:nr.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=vI(t),t===null?null:t.stateNode},findFiberByHostInstance:xo.findFiberByHostInstance||vR,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var nu=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!nu.isDisabled&&nu.supportsFiber)try{jc=nu.inject(ER),yn=nu}catch{}}Mt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=wR;Mt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Dm(e))throw Error(U(200));return yR(t,e,null,n)};Mt.createRoot=function(t,e){if(!Dm(t))throw Error(U(299));var n=!1,r="",i=YT;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=bm(t,1,!1,null,null,n,!1,r,i),t[qn]=e.current,Ta(t.nodeType===8?t.parentNode:t),new Om(e)};Mt.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(U(188)):(t=Object.keys(t).join(","),Error(U(268,t)));return t=vI(e),t=t===null?null:t.stateNode,t};Mt.flushSync=function(t){return ki(t)};Mt.hydrate=function(t,e,n){if(!eh(e))throw Error(U(200));return th(null,t,e,!0,n)};Mt.hydrateRoot=function(t,e,n){if(!Dm(t))throw Error(U(405));var r=n!=null&&n.hydratedSources||null,i=!1,s="",o=YT;if(n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),e=QT(e,null,t,1,n??null,i,!1,s,o),t[qn]=e.current,Ta(t),r)for(t=0;t<r.length;t++)n=r[t],i=n._getVersion,i=i(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,i]:e.mutableSourceEagerHydrationData.push(n,i);return new Zc(e)};Mt.render=function(t,e,n){if(!eh(e))throw Error(U(200));return th(null,t,e,!1,n)};Mt.unmountComponentAtNode=function(t){if(!eh(t))throw Error(U(40));return t._reactRootContainer?(ki(function(){th(null,null,t,!1,function(){t._reactRootContainer=null,t[qn]=null})}),!0):!1};Mt.unstable_batchedUpdates=Cm;Mt.unstable_renderSubtreeIntoContainer=function(t,e,n,r){if(!eh(n))throw Error(U(200));if(t==null||t._reactInternals===void 0)throw Error(U(38));return th(t,e,n,!1,r)};Mt.version="18.3.1-next-f1338f8080-20240426";function JT(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(JT)}catch(t){console.error(t)}}JT(),JE.exports=Mt;var IR=JE.exports,s_=IR;of.createRoot=s_.createRoot,of.hydrateRoot=s_.hydrateRoot;/**
 * @remix-run/router v1.23.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Oa(){return Oa=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},Oa.apply(this,arguments)}var Ir;(function(t){t.Pop="POP",t.Push="PUSH",t.Replace="REPLACE"})(Ir||(Ir={}));const o_="popstate";function TR(t){t===void 0&&(t={});function e(r,i){let{pathname:s,search:o,hash:l}=r.location;return Zf("",{pathname:s,search:o,hash:l},i.state&&i.state.usr||null,i.state&&i.state.key||"default")}function n(r,i){return typeof i=="string"?i:uc(i)}return AR(e,n,null,t)}function Ne(t,e){if(t===!1||t===null||typeof t>"u")throw new Error(e)}function XT(t,e){if(!t){typeof console<"u"&&console.warn(e);try{throw new Error(e)}catch{}}}function SR(){return Math.random().toString(36).substr(2,8)}function a_(t,e){return{usr:t.state,key:t.key,idx:e}}function Zf(t,e,n,r){return n===void 0&&(n=null),Oa({pathname:typeof t=="string"?t:t.pathname,search:"",hash:""},typeof e=="string"?eo(e):e,{state:n,key:e&&e.key||r||SR()})}function uc(t){let{pathname:e="/",search:n="",hash:r=""}=t;return n&&n!=="?"&&(e+=n.charAt(0)==="?"?n:"?"+n),r&&r!=="#"&&(e+=r.charAt(0)==="#"?r:"#"+r),e}function eo(t){let e={};if(t){let n=t.indexOf("#");n>=0&&(e.hash=t.substr(n),t=t.substr(0,n));let r=t.indexOf("?");r>=0&&(e.search=t.substr(r),t=t.substr(0,r)),t&&(e.pathname=t)}return e}function AR(t,e,n,r){r===void 0&&(r={});let{window:i=document.defaultView,v5Compat:s=!1}=r,o=i.history,l=Ir.Pop,u=null,c=d();c==null&&(c=0,o.replaceState(Oa({},o.state,{idx:c}),""));function d(){return(o.state||{idx:null}).idx}function p(){l=Ir.Pop;let N=d(),I=N==null?null:N-c;c=N,u&&u({action:l,location:P.location,delta:I})}function m(N,I){l=Ir.Push;let y=Zf(P.location,N,I);c=d()+1;let S=a_(y,c),b=P.createHref(y);try{o.pushState(S,"",b)}catch(F){if(F instanceof DOMException&&F.name==="DataCloneError")throw F;i.location.assign(b)}s&&u&&u({action:l,location:P.location,delta:1})}function w(N,I){l=Ir.Replace;let y=Zf(P.location,N,I);c=d();let S=a_(y,c),b=P.createHref(y);o.replaceState(S,"",b),s&&u&&u({action:l,location:P.location,delta:0})}function C(N){let I=i.location.origin!=="null"?i.location.origin:i.location.href,y=typeof N=="string"?N:uc(N);return y=y.replace(/ $/,"%20"),Ne(I,"No window.location.(origin|href) available to create URL for href: "+y),new URL(y,I)}let P={get action(){return l},get location(){return t(i,o)},listen(N){if(u)throw new Error("A history only accepts one active listener");return i.addEventListener(o_,p),u=N,()=>{i.removeEventListener(o_,p),u=null}},createHref(N){return e(i,N)},createURL:C,encodeLocation(N){let I=C(N);return{pathname:I.pathname,search:I.search,hash:I.hash}},push:m,replace:w,go(N){return o.go(N)}};return P}var l_;(function(t){t.data="data",t.deferred="deferred",t.redirect="redirect",t.error="error"})(l_||(l_={}));function CR(t,e,n){return n===void 0&&(n="/"),PR(t,e,n)}function PR(t,e,n,r){let i=typeof e=="string"?eo(e):e,s=$s(i.pathname||"/",n);if(s==null)return null;let o=ZT(t);kR(o);let l=null;for(let u=0;l==null&&u<o.length;++u){let c=UR(s);l=VR(o[u],c)}return l}function ZT(t,e,n,r){e===void 0&&(e=[]),n===void 0&&(n=[]),r===void 0&&(r="");let i=(s,o,l)=>{let u={relativePath:l===void 0?s.path||"":l,caseSensitive:s.caseSensitive===!0,childrenIndex:o,route:s};u.relativePath.startsWith("/")&&(Ne(u.relativePath.startsWith(r),'Absolute route path "'+u.relativePath+'" nested under path '+('"'+r+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),u.relativePath=u.relativePath.slice(r.length));let c=Dr([r,u.relativePath]),d=n.concat(u);s.children&&s.children.length>0&&(Ne(s.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+c+'".')),ZT(s.children,e,d,c)),!(s.path==null&&!s.index)&&e.push({path:c,score:MR(c,s.index),routesMeta:d})};return t.forEach((s,o)=>{var l;if(s.path===""||!((l=s.path)!=null&&l.includes("?")))i(s,o);else for(let u of e0(s.path))i(s,o,u)}),e}function e0(t){let e=t.split("/");if(e.length===0)return[];let[n,...r]=e,i=n.endsWith("?"),s=n.replace(/\?$/,"");if(r.length===0)return i?[s,""]:[s];let o=e0(r.join("/")),l=[];return l.push(...o.map(u=>u===""?s:[s,u].join("/"))),i&&l.push(...o),l.map(u=>t.startsWith("/")&&u===""?"/":u)}function kR(t){t.sort((e,n)=>e.score!==n.score?n.score-e.score:LR(e.routesMeta.map(r=>r.childrenIndex),n.routesMeta.map(r=>r.childrenIndex)))}const RR=/^:[\w-]+$/,bR=3,NR=2,OR=1,DR=10,xR=-2,u_=t=>t==="*";function MR(t,e){let n=t.split("/"),r=n.length;return n.some(u_)&&(r+=xR),e&&(r+=NR),n.filter(i=>!u_(i)).reduce((i,s)=>i+(RR.test(s)?bR:s===""?OR:DR),r)}function LR(t,e){return t.length===e.length&&t.slice(0,-1).every((r,i)=>r===e[i])?t[t.length-1]-e[e.length-1]:0}function VR(t,e,n){let{routesMeta:r}=t,i={},s="/",o=[];for(let l=0;l<r.length;++l){let u=r[l],c=l===r.length-1,d=s==="/"?e:e.slice(s.length)||"/",p=ep({path:u.relativePath,caseSensitive:u.caseSensitive,end:c},d),m=u.route;if(!p)return null;Object.assign(i,p.params),o.push({params:i,pathname:Dr([s,p.pathname]),pathnameBase:zR(Dr([s,p.pathnameBase])),route:m}),p.pathnameBase!=="/"&&(s=Dr([s,p.pathnameBase]))}return o}function ep(t,e){typeof t=="string"&&(t={path:t,caseSensitive:!1,end:!0});let[n,r]=FR(t.path,t.caseSensitive,t.end),i=e.match(n);if(!i)return null;let s=i[0],o=s.replace(/(.)\/+$/,"$1"),l=i.slice(1);return{params:r.reduce((c,d,p)=>{let{paramName:m,isOptional:w}=d;if(m==="*"){let P=l[p]||"";o=s.slice(0,s.length-P.length).replace(/(.)\/+$/,"$1")}const C=l[p];return w&&!C?c[m]=void 0:c[m]=(C||"").replace(/%2F/g,"/"),c},{}),pathname:s,pathnameBase:o,pattern:t}}function FR(t,e,n){e===void 0&&(e=!1),n===void 0&&(n=!0),XT(t==="*"||!t.endsWith("*")||t.endsWith("/*"),'Route path "'+t+'" will be treated as if it were '+('"'+t.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+t.replace(/\*$/,"/*")+'".'));let r=[],i="^"+t.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(o,l,u)=>(r.push({paramName:l,isOptional:u!=null}),u?"/?([^\\/]+)?":"/([^\\/]+)"));return t.endsWith("*")?(r.push({paramName:"*"}),i+=t==="*"||t==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):n?i+="\\/*$":t!==""&&t!=="/"&&(i+="(?:(?=\\/|$))"),[new RegExp(i,e?void 0:"i"),r]}function UR(t){try{return t.split("/").map(e=>decodeURIComponent(e).replace(/\//g,"%2F")).join("/")}catch(e){return XT(!1,'The URL path "'+t+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+e+").")),t}}function $s(t,e){if(e==="/")return t;if(!t.toLowerCase().startsWith(e.toLowerCase()))return null;let n=e.endsWith("/")?e.length-1:e.length,r=t.charAt(n);return r&&r!=="/"?null:t.slice(n)||"/"}function $R(t,e){e===void 0&&(e="/");let{pathname:n,search:r="",hash:i=""}=typeof t=="string"?eo(t):t;return{pathname:n?n.startsWith("/")?n:jR(n,e):e,search:HR(r),hash:WR(i)}}function jR(t,e){let n=e.replace(/\/+$/,"").split("/");return t.split("/").forEach(i=>{i===".."?n.length>1&&n.pop():i!=="."&&n.push(i)}),n.length>1?n.join("/"):"/"}function Nd(t,e,n,r){return"Cannot include a '"+t+"' character in a manually specified "+("`to."+e+"` field ["+JSON.stringify(r)+"].  Please separate it out to the ")+("`to."+n+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function BR(t){return t.filter((e,n)=>n===0||e.route.path&&e.route.path.length>0)}function t0(t,e){let n=BR(t);return e?n.map((r,i)=>i===n.length-1?r.pathname:r.pathnameBase):n.map(r=>r.pathnameBase)}function n0(t,e,n,r){r===void 0&&(r=!1);let i;typeof t=="string"?i=eo(t):(i=Oa({},t),Ne(!i.pathname||!i.pathname.includes("?"),Nd("?","pathname","search",i)),Ne(!i.pathname||!i.pathname.includes("#"),Nd("#","pathname","hash",i)),Ne(!i.search||!i.search.includes("#"),Nd("#","search","hash",i)));let s=t===""||i.pathname==="",o=s?"/":i.pathname,l;if(o==null)l=n;else{let p=e.length-1;if(!r&&o.startsWith("..")){let m=o.split("/");for(;m[0]==="..";)m.shift(),p-=1;i.pathname=m.join("/")}l=p>=0?e[p]:"/"}let u=$R(i,l),c=o&&o!=="/"&&o.endsWith("/"),d=(s||o===".")&&n.endsWith("/");return!u.pathname.endsWith("/")&&(c||d)&&(u.pathname+="/"),u}const Dr=t=>t.join("/").replace(/\/\/+/g,"/"),zR=t=>t.replace(/\/+$/,"").replace(/^\/*/,"/"),HR=t=>!t||t==="?"?"":t.startsWith("?")?t:"?"+t,WR=t=>!t||t==="#"?"":t.startsWith("#")?t:"#"+t;function qR(t){return t!=null&&typeof t.status=="number"&&typeof t.statusText=="string"&&typeof t.internal=="boolean"&&"data"in t}const r0=["post","put","patch","delete"];new Set(r0);const GR=["get",...r0];new Set(GR);/**
 * React Router v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Da(){return Da=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},Da.apply(this,arguments)}const nh=L.createContext(null),i0=L.createContext(null),Xr=L.createContext(null),rh=L.createContext(null),Ui=L.createContext({outlet:null,matches:[],isDataRoute:!1}),s0=L.createContext(null);function KR(t,e){let{relative:n}=e===void 0?{}:e;il()||Ne(!1);let{basename:r,navigator:i}=L.useContext(Xr),{hash:s,pathname:o,search:l}=ih(t,{relative:n}),u=o;return r!=="/"&&(u=o==="/"?r:Dr([r,o])),i.createHref({pathname:u,search:l,hash:s})}function il(){return L.useContext(rh)!=null}function to(){return il()||Ne(!1),L.useContext(rh).location}function o0(t){L.useContext(Xr).static||L.useLayoutEffect(t)}function a0(){let{isDataRoute:t}=L.useContext(Ui);return t?ab():QR()}function QR(){il()||Ne(!1);let t=L.useContext(nh),{basename:e,future:n,navigator:r}=L.useContext(Xr),{matches:i}=L.useContext(Ui),{pathname:s}=to(),o=JSON.stringify(t0(i,n.v7_relativeSplatPath)),l=L.useRef(!1);return o0(()=>{l.current=!0}),L.useCallback(function(c,d){if(d===void 0&&(d={}),!l.current)return;if(typeof c=="number"){r.go(c);return}let p=n0(c,JSON.parse(o),s,d.relative==="path");t==null&&e!=="/"&&(p.pathname=p.pathname==="/"?e:Dr([e,p.pathname])),(d.replace?r.replace:r.push)(p,d.state,d)},[e,r,o,s,t])}function ih(t,e){let{relative:n}=e===void 0?{}:e,{future:r}=L.useContext(Xr),{matches:i}=L.useContext(Ui),{pathname:s}=to(),o=JSON.stringify(t0(i,r.v7_relativeSplatPath));return L.useMemo(()=>n0(t,JSON.parse(o),s,n==="path"),[t,o,s,n])}function YR(t,e){return JR(t,e)}function JR(t,e,n,r){il()||Ne(!1);let{navigator:i}=L.useContext(Xr),{matches:s}=L.useContext(Ui),o=s[s.length-1],l=o?o.params:{};o&&o.pathname;let u=o?o.pathnameBase:"/";o&&o.route;let c=to(),d;if(e){var p;let N=typeof e=="string"?eo(e):e;u==="/"||(p=N.pathname)!=null&&p.startsWith(u)||Ne(!1),d=N}else d=c;let m=d.pathname||"/",w=m;if(u!=="/"){let N=u.replace(/^\//,"").split("/");w="/"+m.replace(/^\//,"").split("/").slice(N.length).join("/")}let C=CR(t,{pathname:w}),P=nb(C&&C.map(N=>Object.assign({},N,{params:Object.assign({},l,N.params),pathname:Dr([u,i.encodeLocation?i.encodeLocation(N.pathname).pathname:N.pathname]),pathnameBase:N.pathnameBase==="/"?u:Dr([u,i.encodeLocation?i.encodeLocation(N.pathnameBase).pathname:N.pathnameBase])})),s,n,r);return e&&P?L.createElement(rh.Provider,{value:{location:Da({pathname:"/",search:"",hash:"",state:null,key:"default"},d),navigationType:Ir.Pop}},P):P}function XR(){let t=ob(),e=qR(t)?t.status+" "+t.statusText:t instanceof Error?t.message:JSON.stringify(t),n=t instanceof Error?t.stack:null,i={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return L.createElement(L.Fragment,null,L.createElement("h2",null,"Unexpected Application Error!"),L.createElement("h3",{style:{fontStyle:"italic"}},e),n?L.createElement("pre",{style:i},n):null,null)}const ZR=L.createElement(XR,null);class eb extends L.Component{constructor(e){super(e),this.state={location:e.location,revalidation:e.revalidation,error:e.error}}static getDerivedStateFromError(e){return{error:e}}static getDerivedStateFromProps(e,n){return n.location!==e.location||n.revalidation!=="idle"&&e.revalidation==="idle"?{error:e.error,location:e.location,revalidation:e.revalidation}:{error:e.error!==void 0?e.error:n.error,location:n.location,revalidation:e.revalidation||n.revalidation}}componentDidCatch(e,n){console.error("React Router caught the following error during render",e,n)}render(){return this.state.error!==void 0?L.createElement(Ui.Provider,{value:this.props.routeContext},L.createElement(s0.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function tb(t){let{routeContext:e,match:n,children:r}=t,i=L.useContext(nh);return i&&i.static&&i.staticContext&&(n.route.errorElement||n.route.ErrorBoundary)&&(i.staticContext._deepestRenderedBoundaryId=n.route.id),L.createElement(Ui.Provider,{value:e},r)}function nb(t,e,n,r){var i;if(e===void 0&&(e=[]),n===void 0&&(n=null),r===void 0&&(r=null),t==null){var s;if(!n)return null;if(n.errors)t=n.matches;else if((s=r)!=null&&s.v7_partialHydration&&e.length===0&&!n.initialized&&n.matches.length>0)t=n.matches;else return null}let o=t,l=(i=n)==null?void 0:i.errors;if(l!=null){let d=o.findIndex(p=>p.route.id&&(l==null?void 0:l[p.route.id])!==void 0);d>=0||Ne(!1),o=o.slice(0,Math.min(o.length,d+1))}let u=!1,c=-1;if(n&&r&&r.v7_partialHydration)for(let d=0;d<o.length;d++){let p=o[d];if((p.route.HydrateFallback||p.route.hydrateFallbackElement)&&(c=d),p.route.id){let{loaderData:m,errors:w}=n,C=p.route.loader&&m[p.route.id]===void 0&&(!w||w[p.route.id]===void 0);if(p.route.lazy||C){u=!0,c>=0?o=o.slice(0,c+1):o=[o[0]];break}}}return o.reduceRight((d,p,m)=>{let w,C=!1,P=null,N=null;n&&(w=l&&p.route.id?l[p.route.id]:void 0,P=p.route.errorElement||ZR,u&&(c<0&&m===0?(lb("route-fallback"),C=!0,N=null):c===m&&(C=!0,N=p.route.hydrateFallbackElement||null)));let I=e.concat(o.slice(0,m+1)),y=()=>{let S;return w?S=P:C?S=N:p.route.Component?S=L.createElement(p.route.Component,null):p.route.element?S=p.route.element:S=d,L.createElement(tb,{match:p,routeContext:{outlet:d,matches:I,isDataRoute:n!=null},children:S})};return n&&(p.route.ErrorBoundary||p.route.errorElement||m===0)?L.createElement(eb,{location:n.location,revalidation:n.revalidation,component:P,error:w,children:y(),routeContext:{outlet:null,matches:I,isDataRoute:!0}}):y()},null)}var l0=function(t){return t.UseBlocker="useBlocker",t.UseRevalidator="useRevalidator",t.UseNavigateStable="useNavigate",t}(l0||{}),u0=function(t){return t.UseBlocker="useBlocker",t.UseLoaderData="useLoaderData",t.UseActionData="useActionData",t.UseRouteError="useRouteError",t.UseNavigation="useNavigation",t.UseRouteLoaderData="useRouteLoaderData",t.UseMatches="useMatches",t.UseRevalidator="useRevalidator",t.UseNavigateStable="useNavigate",t.UseRouteId="useRouteId",t}(u0||{});function rb(t){let e=L.useContext(nh);return e||Ne(!1),e}function ib(t){let e=L.useContext(i0);return e||Ne(!1),e}function sb(t){let e=L.useContext(Ui);return e||Ne(!1),e}function c0(t){let e=sb(),n=e.matches[e.matches.length-1];return n.route.id||Ne(!1),n.route.id}function ob(){var t;let e=L.useContext(s0),n=ib(),r=c0();return e!==void 0?e:(t=n.errors)==null?void 0:t[r]}function ab(){let{router:t}=rb(l0.UseNavigateStable),e=c0(u0.UseNavigateStable),n=L.useRef(!1);return o0(()=>{n.current=!0}),L.useCallback(function(i,s){s===void 0&&(s={}),n.current&&(typeof i=="number"?t.navigate(i):t.navigate(i,Da({fromRouteId:e},s)))},[t,e])}const c_={};function lb(t,e,n){c_[t]||(c_[t]=!0)}function ub(t,e){t==null||t.v7_startTransition,t==null||t.v7_relativeSplatPath}function Bo(t){Ne(!1)}function cb(t){let{basename:e="/",children:n=null,location:r,navigationType:i=Ir.Pop,navigator:s,static:o=!1,future:l}=t;il()&&Ne(!1);let u=e.replace(/^\/*/,"/"),c=L.useMemo(()=>({basename:u,navigator:s,static:o,future:Da({v7_relativeSplatPath:!1},l)}),[u,l,s,o]);typeof r=="string"&&(r=eo(r));let{pathname:d="/",search:p="",hash:m="",state:w=null,key:C="default"}=r,P=L.useMemo(()=>{let N=$s(d,u);return N==null?null:{location:{pathname:N,search:p,hash:m,state:w,key:C},navigationType:i}},[u,d,p,m,w,C,i]);return P==null?null:L.createElement(Xr.Provider,{value:c},L.createElement(rh.Provider,{children:n,value:P}))}function hb(t){let{children:e,location:n}=t;return YR(tp(e),n)}new Promise(()=>{});function tp(t,e){e===void 0&&(e=[]);let n=[];return L.Children.forEach(t,(r,i)=>{if(!L.isValidElement(r))return;let s=[...e,i];if(r.type===L.Fragment){n.push.apply(n,tp(r.props.children,s));return}r.type!==Bo&&Ne(!1),!r.props.index||!r.props.children||Ne(!1);let o={id:r.props.id||s.join("-"),caseSensitive:r.props.caseSensitive,element:r.props.element,Component:r.props.Component,index:r.props.index,path:r.props.path,loader:r.props.loader,action:r.props.action,errorElement:r.props.errorElement,ErrorBoundary:r.props.ErrorBoundary,hasErrorBoundary:r.props.ErrorBoundary!=null||r.props.errorElement!=null,shouldRevalidate:r.props.shouldRevalidate,handle:r.props.handle,lazy:r.props.lazy};r.props.children&&(o.children=tp(r.props.children,s)),n.push(o)}),n}/**
 * React Router DOM v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function cc(){return cc=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},cc.apply(this,arguments)}function h0(t,e){if(t==null)return{};var n={},r=Object.keys(t),i,s;for(s=0;s<r.length;s++)i=r[s],!(e.indexOf(i)>=0)&&(n[i]=t[i]);return n}function db(t){return!!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)}function fb(t,e){return t.button===0&&(!e||e==="_self")&&!db(t)}const pb=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],mb=["aria-current","caseSensitive","className","end","style","to","viewTransition","children"],gb="6";try{window.__reactRouterVersion=gb}catch{}const yb=L.createContext({isTransitioning:!1}),vb="startTransition",h_=hP[vb];function _b(t){let{basename:e,children:n,future:r,window:i}=t,s=L.useRef();s.current==null&&(s.current=TR({window:i,v5Compat:!0}));let o=s.current,[l,u]=L.useState({action:o.action,location:o.location}),{v7_startTransition:c}=r||{},d=L.useCallback(p=>{c&&h_?h_(()=>u(p)):u(p)},[u,c]);return L.useLayoutEffect(()=>o.listen(d),[o,d]),L.useEffect(()=>ub(r),[r]),L.createElement(cb,{basename:e,children:n,location:l.location,navigationType:l.action,navigator:o,future:r})}const wb=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",Eb=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,js=L.forwardRef(function(e,n){let{onClick:r,relative:i,reloadDocument:s,replace:o,state:l,target:u,to:c,preventScrollReset:d,viewTransition:p}=e,m=h0(e,pb),{basename:w}=L.useContext(Xr),C,P=!1;if(typeof c=="string"&&Eb.test(c)&&(C=c,wb))try{let S=new URL(window.location.href),b=c.startsWith("//")?new URL(S.protocol+c):new URL(c),F=$s(b.pathname,w);b.origin===S.origin&&F!=null?c=F+b.search+b.hash:P=!0}catch{}let N=KR(c,{relative:i}),I=Tb(c,{replace:o,state:l,target:u,preventScrollReset:d,relative:i,viewTransition:p});function y(S){r&&r(S),S.defaultPrevented||I(S)}return L.createElement("a",cc({},m,{href:C||N,onClick:P||s?r:y,ref:n,target:u}))}),Od=L.forwardRef(function(e,n){let{"aria-current":r="page",caseSensitive:i=!1,className:s="",end:o=!1,style:l,to:u,viewTransition:c,children:d}=e,p=h0(e,mb),m=ih(u,{relative:p.relative}),w=to(),C=L.useContext(i0),{navigator:P,basename:N}=L.useContext(Xr),I=C!=null&&Sb(m)&&c===!0,y=P.encodeLocation?P.encodeLocation(m).pathname:m.pathname,S=w.pathname,b=C&&C.navigation&&C.navigation.location?C.navigation.location.pathname:null;i||(S=S.toLowerCase(),b=b?b.toLowerCase():null,y=y.toLowerCase()),b&&N&&(b=$s(b,N)||b);const F=y!=="/"&&y.endsWith("/")?y.length-1:y.length;let $=S===y||!o&&S.startsWith(y)&&S.charAt(F)==="/",_=b!=null&&(b===y||!o&&b.startsWith(y)&&b.charAt(y.length)==="/"),v={isActive:$,isPending:_,isTransitioning:I},E=$?r:void 0,T;typeof s=="function"?T=s(v):T=[s,$?"active":null,_?"pending":null,I?"transitioning":null].filter(Boolean).join(" ");let k=typeof l=="function"?l(v):l;return L.createElement(js,cc({},p,{"aria-current":E,className:T,ref:n,style:k,to:u,viewTransition:c}),typeof d=="function"?d(v):d)});var np;(function(t){t.UseScrollRestoration="useScrollRestoration",t.UseSubmit="useSubmit",t.UseSubmitFetcher="useSubmitFetcher",t.UseFetcher="useFetcher",t.useViewTransitionState="useViewTransitionState"})(np||(np={}));var d_;(function(t){t.UseFetcher="useFetcher",t.UseFetchers="useFetchers",t.UseScrollRestoration="useScrollRestoration"})(d_||(d_={}));function Ib(t){let e=L.useContext(nh);return e||Ne(!1),e}function Tb(t,e){let{target:n,replace:r,state:i,preventScrollReset:s,relative:o,viewTransition:l}=e===void 0?{}:e,u=a0(),c=to(),d=ih(t,{relative:o});return L.useCallback(p=>{if(fb(p,n)){p.preventDefault();let m=r!==void 0?r:uc(c)===uc(d);u(t,{replace:m,state:i,preventScrollReset:s,relative:o,viewTransition:l})}},[c,u,d,r,i,n,t,s,o,l])}function Sb(t,e){e===void 0&&(e={});let n=L.useContext(yb);n==null&&Ne(!1);let{basename:r}=Ib(np.useViewTransitionState),i=ih(t,{relative:e.relative});if(!n.isTransitioning)return!1;let s=$s(n.currentLocation.pathname,r)||n.currentLocation.pathname,o=$s(n.nextLocation.pathname,r)||n.nextLocation.pathname;return ep(i.pathname,o)!=null||ep(i.pathname,s)!=null}const Ab=()=>{};var f_={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d0=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},Cb=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],l=t[n++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},f0={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,l=o?t[i+1]:0,u=i+2<t.length,c=u?t[i+2]:0,d=s>>2,p=(s&3)<<4|l>>4;let m=(l&15)<<2|c>>6,w=c&63;u||(w=64,o||(m=64)),r.push(n[d],n[p],n[m],n[w])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(d0(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Cb(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],l=i<t.length?n[t.charAt(i)]:0;++i;const c=i<t.length?n[t.charAt(i)]:64;++i;const p=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||l==null||c==null||p==null)throw new Pb;const m=s<<2|l>>4;if(r.push(m),c!==64){const w=l<<4&240|c>>2;if(r.push(w),p!==64){const C=c<<6&192|p;r.push(C)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};let Pb=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const kb=function(t){const e=d0(t);return f0.encodeByteArray(e,!0)},hc=function(t){return kb(t).replace(/\./g,"")},p0=function(t){try{return f0.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rb(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bb=()=>Rb().__FIREBASE_DEFAULTS__,Nb=()=>{if(typeof process>"u"||typeof f_>"u")return;const t=f_.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Ob=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&p0(t[1]);return e&&JSON.parse(e)},sh=()=>{try{return Ab()||bb()||Nb()||Ob()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},m0=t=>{var e,n;return(n=(e=sh())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},g0=t=>{const e=m0(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},y0=()=>{var t;return(t=sh())===null||t===void 0?void 0:t.config},v0=t=>{var e;return(e=sh())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Db=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $i(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function xm(t){return(await fetch(t,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xb(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",i=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},t);return[hc(JSON.stringify(n)),hc(JSON.stringify(o)),""].join(".")}const aa={};function Mb(){const t={prod:[],emulator:[]};for(const e of Object.keys(aa))aa[e]?t.emulator.push(e):t.prod.push(e);return t}function Lb(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}let p_=!1;function Mm(t,e){if(typeof window>"u"||typeof document>"u"||!$i(window.location.host)||aa[t]===e||aa[t]||p_)return;aa[t]=e;function n(m){return`__firebase__banner__${m}`}const r="__firebase__banner",s=Mb().prod.length>0;function o(){const m=document.getElementById(r);m&&m.remove()}function l(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function u(m,w){m.setAttribute("width","24"),m.setAttribute("id",w),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function c(){const m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{p_=!0,o()},m}function d(m,w){m.setAttribute("id",w),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){const m=Lb(r),w=n("text"),C=document.getElementById(w)||document.createElement("span"),P=n("learnmore"),N=document.getElementById(P)||document.createElement("a"),I=n("preprendIcon"),y=document.getElementById(I)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){const S=m.element;l(S),d(N,P);const b=c();u(y,I),S.append(y,C,N,b),document.body.appendChild(S)}s?(C.innerText="Preview backend disconnected.",y.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(y.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,C.innerText="Preview backend running in this workspace."),C.setAttribute("id",w)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ut(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Vb(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ut())}function Fb(){var t;const e=(t=sh())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Ub(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function $b(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function jb(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Bb(){const t=ut();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function zb(){return!Fb()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function _0(){try{return typeof indexedDB=="object"}catch{return!1}}function w0(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(n){e(n)}})}function Hb(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wb="FirebaseError";let rr=class E0 extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=Wb,Object.setPrototypeOf(this,E0.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ji.prototype.create)}},ji=class{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?qb(s,r):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new rr(i,l,r)}};function qb(t,e){return t.replace(Gb,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Gb=/\{\$([^}]+)}/g;function Kb(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Ri(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(m_(s)&&m_(o)){if(!Ri(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function m_(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sl(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function zo(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Ho(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function Qb(t,e){const n=new Yb(t,e);return n.subscribe.bind(n)}let Yb=class{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");Jb(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=Dd),i.error===void 0&&(i.error=Dd),i.complete===void 0&&(i.complete=Dd);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function Jb(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Dd(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ie(t){return t&&t._delegate?t._delegate:t}let Kt=class{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ci="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Xb=class{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Db;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(eN(e))try{this.getOrInitializeService({instanceIdentifier:ci})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=ci){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ci){return this.instances.has(e)}getOptions(e=ci){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&o.resolve(i)}return i}onInit(e,n){var r;const i=this.normalizeInstanceIdentifier(n),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Zb(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=ci){return this.component?this.component.multipleInstances?e:ci:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function Zb(t){return t===ci?void 0:t}function eN(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let tN=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Xb(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ie;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(ie||(ie={}));const nN={debug:ie.DEBUG,verbose:ie.VERBOSE,info:ie.INFO,warn:ie.WARN,error:ie.ERROR,silent:ie.SILENT},rN=ie.INFO,iN={[ie.DEBUG]:"log",[ie.VERBOSE]:"log",[ie.INFO]:"info",[ie.WARN]:"warn",[ie.ERROR]:"error"},sN=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=iN[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let Lm=class{constructor(e){this.name=e,this._logLevel=rN,this._logHandler=sN,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ie))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?nN[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ie.DEBUG,...e),this._logHandler(this,ie.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ie.VERBOSE,...e),this._logHandler(this,ie.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ie.INFO,...e),this._logHandler(this,ie.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ie.WARN,...e),this._logHandler(this,ie.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ie.ERROR,...e),this._logHandler(this,ie.ERROR,...e)}};const oN=(t,e)=>e.some(n=>t instanceof n);let g_,y_;function aN(){return g_||(g_=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function lN(){return y_||(y_=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const I0=new WeakMap,rp=new WeakMap,T0=new WeakMap,xd=new WeakMap,Vm=new WeakMap;function uN(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(Hn(t.result)),i()},o=()=>{r(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&I0.set(n,t)}).catch(()=>{}),Vm.set(e,t),e}function cN(t){if(rp.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),i()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});rp.set(t,e)}let ip={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return rp.get(t);if(e==="objectStoreNames")return t.objectStoreNames||T0.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Hn(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function hN(t){ip=t(ip)}function dN(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Md(this),e,...n);return T0.set(r,e.sort?e.sort():[e]),Hn(r)}:lN().includes(t)?function(...e){return t.apply(Md(this),e),Hn(I0.get(this))}:function(...e){return Hn(t.apply(Md(this),e))}}function fN(t){return typeof t=="function"?dN(t):(t instanceof IDBTransaction&&cN(t),oN(t,aN())?new Proxy(t,ip):t)}function Hn(t){if(t instanceof IDBRequest)return uN(t);if(xd.has(t))return xd.get(t);const e=fN(t);return e!==t&&(xd.set(t,e),Vm.set(e,t)),e}const Md=t=>Vm.get(t);function ol(t,e,{blocked:n,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),l=Hn(o);return r&&o.addEventListener("upgradeneeded",u=>{r(Hn(o.result),u.oldVersion,u.newVersion,Hn(o.transaction),u)}),n&&o.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),l.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",c=>i(c.oldVersion,c.newVersion,c))}).catch(()=>{}),l}function Ld(t,{blocked:e}={}){const n=indexedDB.deleteDatabase(t);return e&&n.addEventListener("blocked",r=>e(r.oldVersion,r)),Hn(n).then(()=>{})}const pN=["get","getKey","getAll","getAllKeys","count"],mN=["put","add","delete","clear"],Vd=new Map;function v_(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Vd.get(e))return Vd.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=mN.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||pN.includes(n)))return;const s=async function(o,...l){const u=this.transaction(o,i?"readwrite":"readonly");let c=u.store;return r&&(c=c.index(l.shift())),(await Promise.all([c[n](...l),i&&u.done]))[0]};return Vd.set(e,s),s}hN(t=>({...t,get:(e,n,r)=>v_(e,n)||t.get(e,n,r),has:(e,n)=>!!v_(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let gN=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(yN(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}};function yN(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const sp="@firebase/app",__="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qn=new Lm("@firebase/app"),vN="@firebase/app-compat",_N="@firebase/analytics-compat",wN="@firebase/analytics",EN="@firebase/app-check-compat",IN="@firebase/app-check",TN="@firebase/auth",SN="@firebase/auth-compat",AN="@firebase/database",CN="@firebase/data-connect",PN="@firebase/database-compat",kN="@firebase/functions",RN="@firebase/functions-compat",bN="@firebase/installations",NN="@firebase/installations-compat",ON="@firebase/messaging",DN="@firebase/messaging-compat",xN="@firebase/performance",MN="@firebase/performance-compat",LN="@firebase/remote-config",VN="@firebase/remote-config-compat",FN="@firebase/storage",UN="@firebase/storage-compat",$N="@firebase/firestore",jN="@firebase/ai",BN="@firebase/firestore-compat",zN="firebase",HN="11.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const op="[DEFAULT]",WN={[sp]:"fire-core",[vN]:"fire-core-compat",[wN]:"fire-analytics",[_N]:"fire-analytics-compat",[IN]:"fire-app-check",[EN]:"fire-app-check-compat",[TN]:"fire-auth",[SN]:"fire-auth-compat",[AN]:"fire-rtdb",[CN]:"fire-data-connect",[PN]:"fire-rtdb-compat",[kN]:"fire-fn",[RN]:"fire-fn-compat",[bN]:"fire-iid",[NN]:"fire-iid-compat",[ON]:"fire-fcm",[DN]:"fire-fcm-compat",[xN]:"fire-perf",[MN]:"fire-perf-compat",[LN]:"fire-rc",[VN]:"fire-rc-compat",[FN]:"fire-gcs",[UN]:"fire-gcs-compat",[$N]:"fire-fst",[BN]:"fire-fst-compat",[jN]:"fire-vertex","fire-js":"fire-js",[zN]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xa=new Map,qN=new Map,ap=new Map;function w_(t,e){try{t.container.addComponent(e)}catch(n){Qn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function ln(t){const e=t.name;if(ap.has(e))return Qn.debug(`There were multiple attempts to register component ${e}.`),!1;ap.set(e,t);for(const n of xa.values())w_(n,t);for(const n of qN.values())w_(n,t);return!0}function Bi(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Bt(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GN={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},xr=new ji("app","Firebase",GN);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let KN=class{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Kt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw xr.create("app-deleted",{appName:this._name})}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const no=HN;function S0(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:op,automaticDataCollectionEnabled:!0},e),i=r.name;if(typeof i!="string"||!i)throw xr.create("bad-app-name",{appName:String(i)});if(n||(n=y0()),!n)throw xr.create("no-options");const s=xa.get(i);if(s){if(Ri(n,s.options)&&Ri(r,s.config))return s;throw xr.create("duplicate-app",{appName:i})}const o=new tN(i);for(const u of ap.values())o.addComponent(u);const l=new KN(n,r,o);return xa.set(i,l),l}function oh(t=op){const e=xa.get(t);if(!e&&t===op&&y0())return S0();if(!e)throw xr.create("no-app",{appName:t});return e}function QN(){return Array.from(xa.values())}function Ct(t,e,n){var r;let i=(r=WN[t])!==null&&r!==void 0?r:t;n&&(i+=`-${n}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const l=[`Unable to register library "${i}" with version "${e}":`];s&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&l.push("and"),o&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Qn.warn(l.join(" "));return}ln(new Kt(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YN="firebase-heartbeat-database",JN=1,Ma="firebase-heartbeat-store";let Fd=null;function A0(){return Fd||(Fd=ol(YN,JN,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Ma)}catch(n){console.warn(n)}}}}).catch(t=>{throw xr.create("idb-open",{originalErrorMessage:t.message})})),Fd}async function XN(t){try{const n=(await A0()).transaction(Ma),r=await n.objectStore(Ma).get(C0(t));return await n.done,r}catch(e){if(e instanceof rr)Qn.warn(e.message);else{const n=xr.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Qn.warn(n.message)}}}async function E_(t,e){try{const r=(await A0()).transaction(Ma,"readwrite");await r.objectStore(Ma).put(e,C0(t)),await r.done}catch(n){if(n instanceof rr)Qn.warn(n.message);else{const r=xr.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Qn.warn(r.message)}}}function C0(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZN=1024,eO=30;let tO=class{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new rO(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=I_();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>eO){const o=iO(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Qn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=I_(),{heartbeatsToSend:r,unsentEntries:i}=nO(this._heartbeatsCache.heartbeats),s=hc(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return Qn.warn(n),""}}};function I_(){return new Date().toISOString().substring(0,10)}function nO(t,e=ZN){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),T_(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),T_(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}let rO=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return _0()?w0().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await XN(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return E_(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return E_(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}};function T_(t){return hc(JSON.stringify({version:2,heartbeats:t})).length}function iO(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sO(t){ln(new Kt("platform-logger",e=>new gN(e),"PRIVATE")),ln(new Kt("heartbeat",e=>new tO(e),"PRIVATE")),Ct(sp,__,t),Ct(sp,__,"esm2017"),Ct("fire-js","")}sO("");var oO="firebase",aO="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ct(oO,aO,"app");var S_=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Mr,P0;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(_,v){function E(){}E.prototype=v.prototype,_.D=v.prototype,_.prototype=new E,_.prototype.constructor=_,_.C=function(T,k,R){for(var A=Array(arguments.length-2),ct=2;ct<arguments.length;ct++)A[ct-2]=arguments[ct];return v.prototype[k].apply(T,A)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(_,v,E){E||(E=0);var T=Array(16);if(typeof v=="string")for(var k=0;16>k;++k)T[k]=v.charCodeAt(E++)|v.charCodeAt(E++)<<8|v.charCodeAt(E++)<<16|v.charCodeAt(E++)<<24;else for(k=0;16>k;++k)T[k]=v[E++]|v[E++]<<8|v[E++]<<16|v[E++]<<24;v=_.g[0],E=_.g[1],k=_.g[2];var R=_.g[3],A=v+(R^E&(k^R))+T[0]+3614090360&4294967295;v=E+(A<<7&4294967295|A>>>25),A=R+(k^v&(E^k))+T[1]+3905402710&4294967295,R=v+(A<<12&4294967295|A>>>20),A=k+(E^R&(v^E))+T[2]+606105819&4294967295,k=R+(A<<17&4294967295|A>>>15),A=E+(v^k&(R^v))+T[3]+3250441966&4294967295,E=k+(A<<22&4294967295|A>>>10),A=v+(R^E&(k^R))+T[4]+4118548399&4294967295,v=E+(A<<7&4294967295|A>>>25),A=R+(k^v&(E^k))+T[5]+1200080426&4294967295,R=v+(A<<12&4294967295|A>>>20),A=k+(E^R&(v^E))+T[6]+2821735955&4294967295,k=R+(A<<17&4294967295|A>>>15),A=E+(v^k&(R^v))+T[7]+4249261313&4294967295,E=k+(A<<22&4294967295|A>>>10),A=v+(R^E&(k^R))+T[8]+1770035416&4294967295,v=E+(A<<7&4294967295|A>>>25),A=R+(k^v&(E^k))+T[9]+2336552879&4294967295,R=v+(A<<12&4294967295|A>>>20),A=k+(E^R&(v^E))+T[10]+4294925233&4294967295,k=R+(A<<17&4294967295|A>>>15),A=E+(v^k&(R^v))+T[11]+2304563134&4294967295,E=k+(A<<22&4294967295|A>>>10),A=v+(R^E&(k^R))+T[12]+1804603682&4294967295,v=E+(A<<7&4294967295|A>>>25),A=R+(k^v&(E^k))+T[13]+4254626195&4294967295,R=v+(A<<12&4294967295|A>>>20),A=k+(E^R&(v^E))+T[14]+2792965006&4294967295,k=R+(A<<17&4294967295|A>>>15),A=E+(v^k&(R^v))+T[15]+1236535329&4294967295,E=k+(A<<22&4294967295|A>>>10),A=v+(k^R&(E^k))+T[1]+4129170786&4294967295,v=E+(A<<5&4294967295|A>>>27),A=R+(E^k&(v^E))+T[6]+3225465664&4294967295,R=v+(A<<9&4294967295|A>>>23),A=k+(v^E&(R^v))+T[11]+643717713&4294967295,k=R+(A<<14&4294967295|A>>>18),A=E+(R^v&(k^R))+T[0]+3921069994&4294967295,E=k+(A<<20&4294967295|A>>>12),A=v+(k^R&(E^k))+T[5]+3593408605&4294967295,v=E+(A<<5&4294967295|A>>>27),A=R+(E^k&(v^E))+T[10]+38016083&4294967295,R=v+(A<<9&4294967295|A>>>23),A=k+(v^E&(R^v))+T[15]+3634488961&4294967295,k=R+(A<<14&4294967295|A>>>18),A=E+(R^v&(k^R))+T[4]+3889429448&4294967295,E=k+(A<<20&4294967295|A>>>12),A=v+(k^R&(E^k))+T[9]+568446438&4294967295,v=E+(A<<5&4294967295|A>>>27),A=R+(E^k&(v^E))+T[14]+3275163606&4294967295,R=v+(A<<9&4294967295|A>>>23),A=k+(v^E&(R^v))+T[3]+4107603335&4294967295,k=R+(A<<14&4294967295|A>>>18),A=E+(R^v&(k^R))+T[8]+1163531501&4294967295,E=k+(A<<20&4294967295|A>>>12),A=v+(k^R&(E^k))+T[13]+2850285829&4294967295,v=E+(A<<5&4294967295|A>>>27),A=R+(E^k&(v^E))+T[2]+4243563512&4294967295,R=v+(A<<9&4294967295|A>>>23),A=k+(v^E&(R^v))+T[7]+1735328473&4294967295,k=R+(A<<14&4294967295|A>>>18),A=E+(R^v&(k^R))+T[12]+2368359562&4294967295,E=k+(A<<20&4294967295|A>>>12),A=v+(E^k^R)+T[5]+4294588738&4294967295,v=E+(A<<4&4294967295|A>>>28),A=R+(v^E^k)+T[8]+2272392833&4294967295,R=v+(A<<11&4294967295|A>>>21),A=k+(R^v^E)+T[11]+1839030562&4294967295,k=R+(A<<16&4294967295|A>>>16),A=E+(k^R^v)+T[14]+4259657740&4294967295,E=k+(A<<23&4294967295|A>>>9),A=v+(E^k^R)+T[1]+2763975236&4294967295,v=E+(A<<4&4294967295|A>>>28),A=R+(v^E^k)+T[4]+1272893353&4294967295,R=v+(A<<11&4294967295|A>>>21),A=k+(R^v^E)+T[7]+4139469664&4294967295,k=R+(A<<16&4294967295|A>>>16),A=E+(k^R^v)+T[10]+3200236656&4294967295,E=k+(A<<23&4294967295|A>>>9),A=v+(E^k^R)+T[13]+681279174&4294967295,v=E+(A<<4&4294967295|A>>>28),A=R+(v^E^k)+T[0]+3936430074&4294967295,R=v+(A<<11&4294967295|A>>>21),A=k+(R^v^E)+T[3]+3572445317&4294967295,k=R+(A<<16&4294967295|A>>>16),A=E+(k^R^v)+T[6]+76029189&4294967295,E=k+(A<<23&4294967295|A>>>9),A=v+(E^k^R)+T[9]+3654602809&4294967295,v=E+(A<<4&4294967295|A>>>28),A=R+(v^E^k)+T[12]+3873151461&4294967295,R=v+(A<<11&4294967295|A>>>21),A=k+(R^v^E)+T[15]+530742520&4294967295,k=R+(A<<16&4294967295|A>>>16),A=E+(k^R^v)+T[2]+3299628645&4294967295,E=k+(A<<23&4294967295|A>>>9),A=v+(k^(E|~R))+T[0]+4096336452&4294967295,v=E+(A<<6&4294967295|A>>>26),A=R+(E^(v|~k))+T[7]+1126891415&4294967295,R=v+(A<<10&4294967295|A>>>22),A=k+(v^(R|~E))+T[14]+2878612391&4294967295,k=R+(A<<15&4294967295|A>>>17),A=E+(R^(k|~v))+T[5]+4237533241&4294967295,E=k+(A<<21&4294967295|A>>>11),A=v+(k^(E|~R))+T[12]+1700485571&4294967295,v=E+(A<<6&4294967295|A>>>26),A=R+(E^(v|~k))+T[3]+2399980690&4294967295,R=v+(A<<10&4294967295|A>>>22),A=k+(v^(R|~E))+T[10]+4293915773&4294967295,k=R+(A<<15&4294967295|A>>>17),A=E+(R^(k|~v))+T[1]+2240044497&4294967295,E=k+(A<<21&4294967295|A>>>11),A=v+(k^(E|~R))+T[8]+1873313359&4294967295,v=E+(A<<6&4294967295|A>>>26),A=R+(E^(v|~k))+T[15]+4264355552&4294967295,R=v+(A<<10&4294967295|A>>>22),A=k+(v^(R|~E))+T[6]+2734768916&4294967295,k=R+(A<<15&4294967295|A>>>17),A=E+(R^(k|~v))+T[13]+1309151649&4294967295,E=k+(A<<21&4294967295|A>>>11),A=v+(k^(E|~R))+T[4]+4149444226&4294967295,v=E+(A<<6&4294967295|A>>>26),A=R+(E^(v|~k))+T[11]+3174756917&4294967295,R=v+(A<<10&4294967295|A>>>22),A=k+(v^(R|~E))+T[2]+718787259&4294967295,k=R+(A<<15&4294967295|A>>>17),A=E+(R^(k|~v))+T[9]+3951481745&4294967295,_.g[0]=_.g[0]+v&4294967295,_.g[1]=_.g[1]+(k+(A<<21&4294967295|A>>>11))&4294967295,_.g[2]=_.g[2]+k&4294967295,_.g[3]=_.g[3]+R&4294967295}r.prototype.u=function(_,v){v===void 0&&(v=_.length);for(var E=v-this.blockSize,T=this.B,k=this.h,R=0;R<v;){if(k==0)for(;R<=E;)i(this,_,R),R+=this.blockSize;if(typeof _=="string"){for(;R<v;)if(T[k++]=_.charCodeAt(R++),k==this.blockSize){i(this,T),k=0;break}}else for(;R<v;)if(T[k++]=_[R++],k==this.blockSize){i(this,T),k=0;break}}this.h=k,this.o+=v},r.prototype.v=function(){var _=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);_[0]=128;for(var v=1;v<_.length-8;++v)_[v]=0;var E=8*this.o;for(v=_.length-8;v<_.length;++v)_[v]=E&255,E/=256;for(this.u(_),_=Array(16),v=E=0;4>v;++v)for(var T=0;32>T;T+=8)_[E++]=this.g[v]>>>T&255;return _};function s(_,v){var E=l;return Object.prototype.hasOwnProperty.call(E,_)?E[_]:E[_]=v(_)}function o(_,v){this.h=v;for(var E=[],T=!0,k=_.length-1;0<=k;k--){var R=_[k]|0;T&&R==v||(E[k]=R,T=!1)}this.g=E}var l={};function u(_){return-128<=_&&128>_?s(_,function(v){return new o([v|0],0>v?-1:0)}):new o([_|0],0>_?-1:0)}function c(_){if(isNaN(_)||!isFinite(_))return p;if(0>_)return N(c(-_));for(var v=[],E=1,T=0;_>=E;T++)v[T]=_/E|0,E*=4294967296;return new o(v,0)}function d(_,v){if(_.length==0)throw Error("number format error: empty string");if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(_.charAt(0)=="-")return N(d(_.substring(1),v));if(0<=_.indexOf("-"))throw Error('number format error: interior "-" character');for(var E=c(Math.pow(v,8)),T=p,k=0;k<_.length;k+=8){var R=Math.min(8,_.length-k),A=parseInt(_.substring(k,k+R),v);8>R?(R=c(Math.pow(v,R)),T=T.j(R).add(c(A))):(T=T.j(E),T=T.add(c(A)))}return T}var p=u(0),m=u(1),w=u(16777216);t=o.prototype,t.m=function(){if(P(this))return-N(this).m();for(var _=0,v=1,E=0;E<this.g.length;E++){var T=this.i(E);_+=(0<=T?T:4294967296+T)*v,v*=4294967296}return _},t.toString=function(_){if(_=_||10,2>_||36<_)throw Error("radix out of range: "+_);if(C(this))return"0";if(P(this))return"-"+N(this).toString(_);for(var v=c(Math.pow(_,6)),E=this,T="";;){var k=b(E,v).g;E=I(E,k.j(v));var R=((0<E.g.length?E.g[0]:E.h)>>>0).toString(_);if(E=k,C(E))return R+T;for(;6>R.length;)R="0"+R;T=R+T}},t.i=function(_){return 0>_?0:_<this.g.length?this.g[_]:this.h};function C(_){if(_.h!=0)return!1;for(var v=0;v<_.g.length;v++)if(_.g[v]!=0)return!1;return!0}function P(_){return _.h==-1}t.l=function(_){return _=I(this,_),P(_)?-1:C(_)?0:1};function N(_){for(var v=_.g.length,E=[],T=0;T<v;T++)E[T]=~_.g[T];return new o(E,~_.h).add(m)}t.abs=function(){return P(this)?N(this):this},t.add=function(_){for(var v=Math.max(this.g.length,_.g.length),E=[],T=0,k=0;k<=v;k++){var R=T+(this.i(k)&65535)+(_.i(k)&65535),A=(R>>>16)+(this.i(k)>>>16)+(_.i(k)>>>16);T=A>>>16,R&=65535,A&=65535,E[k]=A<<16|R}return new o(E,E[E.length-1]&-2147483648?-1:0)};function I(_,v){return _.add(N(v))}t.j=function(_){if(C(this)||C(_))return p;if(P(this))return P(_)?N(this).j(N(_)):N(N(this).j(_));if(P(_))return N(this.j(N(_)));if(0>this.l(w)&&0>_.l(w))return c(this.m()*_.m());for(var v=this.g.length+_.g.length,E=[],T=0;T<2*v;T++)E[T]=0;for(T=0;T<this.g.length;T++)for(var k=0;k<_.g.length;k++){var R=this.i(T)>>>16,A=this.i(T)&65535,ct=_.i(k)>>>16,kn=_.i(k)&65535;E[2*T+2*k]+=A*kn,y(E,2*T+2*k),E[2*T+2*k+1]+=R*kn,y(E,2*T+2*k+1),E[2*T+2*k+1]+=A*ct,y(E,2*T+2*k+1),E[2*T+2*k+2]+=R*ct,y(E,2*T+2*k+2)}for(T=0;T<v;T++)E[T]=E[2*T+1]<<16|E[2*T];for(T=v;T<2*v;T++)E[T]=0;return new o(E,0)};function y(_,v){for(;(_[v]&65535)!=_[v];)_[v+1]+=_[v]>>>16,_[v]&=65535,v++}function S(_,v){this.g=_,this.h=v}function b(_,v){if(C(v))throw Error("division by zero");if(C(_))return new S(p,p);if(P(_))return v=b(N(_),v),new S(N(v.g),N(v.h));if(P(v))return v=b(_,N(v)),new S(N(v.g),v.h);if(30<_.g.length){if(P(_)||P(v))throw Error("slowDivide_ only works with positive integers.");for(var E=m,T=v;0>=T.l(_);)E=F(E),T=F(T);var k=$(E,1),R=$(T,1);for(T=$(T,2),E=$(E,2);!C(T);){var A=R.add(T);0>=A.l(_)&&(k=k.add(E),R=A),T=$(T,1),E=$(E,1)}return v=I(_,k.j(v)),new S(k,v)}for(k=p;0<=_.l(v);){for(E=Math.max(1,Math.floor(_.m()/v.m())),T=Math.ceil(Math.log(E)/Math.LN2),T=48>=T?1:Math.pow(2,T-48),R=c(E),A=R.j(v);P(A)||0<A.l(_);)E-=T,R=c(E),A=R.j(v);C(R)&&(R=m),k=k.add(R),_=I(_,A)}return new S(k,_)}t.A=function(_){return b(this,_).h},t.and=function(_){for(var v=Math.max(this.g.length,_.g.length),E=[],T=0;T<v;T++)E[T]=this.i(T)&_.i(T);return new o(E,this.h&_.h)},t.or=function(_){for(var v=Math.max(this.g.length,_.g.length),E=[],T=0;T<v;T++)E[T]=this.i(T)|_.i(T);return new o(E,this.h|_.h)},t.xor=function(_){for(var v=Math.max(this.g.length,_.g.length),E=[],T=0;T<v;T++)E[T]=this.i(T)^_.i(T);return new o(E,this.h^_.h)};function F(_){for(var v=_.g.length+1,E=[],T=0;T<v;T++)E[T]=_.i(T)<<1|_.i(T-1)>>>31;return new o(E,_.h)}function $(_,v){var E=v>>5;v%=32;for(var T=_.g.length-E,k=[],R=0;R<T;R++)k[R]=0<v?_.i(R+E)>>>v|_.i(R+E+1)<<32-v:_.i(R+E);return new o(k,_.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,P0=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=c,o.fromString=d,Mr=o}).apply(typeof S_<"u"?S_:typeof self<"u"?self:typeof window<"u"?window:{});var ru=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var k0,Wo,R0,Su,lp,b0,N0,O0;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,h,f){return a==Array.prototype||a==Object.prototype||(a[h]=f.value),a};function n(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof ru=="object"&&ru];for(var h=0;h<a.length;++h){var f=a[h];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=n(this);function i(a,h){if(h)e:{var f=r;a=a.split(".");for(var g=0;g<a.length-1;g++){var O=a[g];if(!(O in f))break e;f=f[O]}a=a[a.length-1],g=f[a],h=h(g),h!=g&&h!=null&&e(f,a,{configurable:!0,writable:!0,value:h})}}function s(a,h){a instanceof String&&(a+="");var f=0,g=!1,O={next:function(){if(!g&&f<a.length){var x=f++;return{value:h(x,a[x]),done:!1}}return g=!0,{done:!0,value:void 0}}};return O[Symbol.iterator]=function(){return O},O}i("Array.prototype.values",function(a){return a||function(){return s(this,function(h,f){return f})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},l=this||self;function u(a){var h=typeof a;return h=h!="object"?h:a?Array.isArray(a)?"array":h:"null",h=="array"||h=="object"&&typeof a.length=="number"}function c(a){var h=typeof a;return h=="object"&&a!=null||h=="function"}function d(a,h,f){return a.call.apply(a.bind,arguments)}function p(a,h,f){if(!a)throw Error();if(2<arguments.length){var g=Array.prototype.slice.call(arguments,2);return function(){var O=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(O,g),a.apply(h,O)}}return function(){return a.apply(h,arguments)}}function m(a,h,f){return m=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?d:p,m.apply(null,arguments)}function w(a,h){var f=Array.prototype.slice.call(arguments,1);return function(){var g=f.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function C(a,h){function f(){}f.prototype=h.prototype,a.aa=h.prototype,a.prototype=new f,a.prototype.constructor=a,a.Qb=function(g,O,x){for(var j=Array(arguments.length-2),de=2;de<arguments.length;de++)j[de-2]=arguments[de];return h.prototype[O].apply(g,j)}}function P(a){const h=a.length;if(0<h){const f=Array(h);for(let g=0;g<h;g++)f[g]=a[g];return f}return[]}function N(a,h){for(let f=1;f<arguments.length;f++){const g=arguments[f];if(u(g)){const O=a.length||0,x=g.length||0;a.length=O+x;for(let j=0;j<x;j++)a[O+j]=g[j]}else a.push(g)}}class I{constructor(h,f){this.i=h,this.j=f,this.h=0,this.g=null}get(){let h;return 0<this.h?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function y(a){return/^[\s\xa0]*$/.test(a)}function S(){var a=l.navigator;return a&&(a=a.userAgent)?a:""}function b(a){return b[" "](a),a}b[" "]=function(){};var F=S().indexOf("Gecko")!=-1&&!(S().toLowerCase().indexOf("webkit")!=-1&&S().indexOf("Edge")==-1)&&!(S().indexOf("Trident")!=-1||S().indexOf("MSIE")!=-1)&&S().indexOf("Edge")==-1;function $(a,h,f){for(const g in a)h.call(f,a[g],g,a)}function _(a,h){for(const f in a)h.call(void 0,a[f],f,a)}function v(a){const h={};for(const f in a)h[f]=a[f];return h}const E="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function T(a,h){let f,g;for(let O=1;O<arguments.length;O++){g=arguments[O];for(f in g)a[f]=g[f];for(let x=0;x<E.length;x++)f=E[x],Object.prototype.hasOwnProperty.call(g,f)&&(a[f]=g[f])}}function k(a){var h=1;a=a.split(":");const f=[];for(;0<h&&a.length;)f.push(a.shift()),h--;return a.length&&f.push(a.join(":")),f}function R(a){l.setTimeout(()=>{throw a},0)}function A(){var a=Y;let h=null;return a.g&&(h=a.g,a.g=a.g.next,a.g||(a.h=null),h.next=null),h}class ct{constructor(){this.h=this.g=null}add(h,f){const g=kn.get();g.set(h,f),this.h?this.h.next=g:this.g=g,this.h=g}}var kn=new I(()=>new Rn,a=>a.reset());class Rn{constructor(){this.next=this.g=this.h=null}set(h,f){this.h=h,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let Vt,B=!1,Y=new ct,J=()=>{const a=l.Promise.resolve(void 0);Vt=()=>{a.then(ge)}};var ge=()=>{for(var a;a=A();){try{a.h.call(a.g)}catch(f){R(f)}var h=kn;h.j(a),100>h.h&&(h.h++,a.next=h.g,h.g=a)}B=!1};function re(){this.s=this.s,this.C=this.C}re.prototype.s=!1,re.prototype.ma=function(){this.s||(this.s=!0,this.N())},re.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Te(a,h){this.type=a,this.g=this.target=h,this.defaultPrevented=!1}Te.prototype.h=function(){this.defaultPrevented=!0};var Pt=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var a=!1,h=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const f=()=>{};l.addEventListener("test",f,h),l.removeEventListener("test",f,h)}catch{}return a}();function Qt(a,h){if(Te.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var f=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=h,h=a.relatedTarget){if(F){e:{try{b(h.nodeName);var O=!0;break e}catch{}O=!1}O||(h=null)}}else f=="mouseover"?h=a.fromElement:f=="mouseout"&&(h=a.toElement);this.relatedTarget=h,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:Yt[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&Qt.aa.h.call(this)}}C(Qt,Te);var Yt={2:"touch",3:"pen",4:"mouse"};Qt.prototype.h=function(){Qt.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Ft="closure_listenable_"+(1e6*Math.random()|0),Tl=0;function ri(a,h,f,g,O){this.listener=a,this.proxy=null,this.src=h,this.type=f,this.capture=!!g,this.ha=O,this.key=++Tl,this.da=this.fa=!1}function q(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Se(a){this.src=a,this.g={},this.h=0}Se.prototype.add=function(a,h,f,g,O){var x=a.toString();a=this.g[x],a||(a=this.g[x]=[],this.h++);var j=fo(a,h,g,O);return-1<j?(h=a[j],f||(h.fa=!1)):(h=new ri(h,this.src,x,!!g,O),h.fa=f,a.push(h)),h};function ho(a,h){var f=h.type;if(f in a.g){var g=a.g[f],O=Array.prototype.indexOf.call(g,h,void 0),x;(x=0<=O)&&Array.prototype.splice.call(g,O,1),x&&(q(h),a.g[f].length==0&&(delete a.g[f],a.h--))}}function fo(a,h,f,g){for(var O=0;O<a.length;++O){var x=a[O];if(!x.da&&x.listener==h&&x.capture==!!f&&x.ha==g)return O}return-1}var Fh="closure_lm_"+(1e6*Math.random()|0),Uh={};function Xg(a,h,f,g,O){if(Array.isArray(h)){for(var x=0;x<h.length;x++)Xg(a,h[x],f,g,O);return null}return f=ty(f),a&&a[Ft]?a.K(h,f,c(g)?!!g.capture:!1,O):_C(a,h,f,!1,g,O)}function _C(a,h,f,g,O,x){if(!h)throw Error("Invalid event type");var j=c(O)?!!O.capture:!!O,de=jh(a);if(de||(a[Fh]=de=new Se(a)),f=de.add(h,f,g,j,x),f.proxy)return f;if(g=wC(),f.proxy=g,g.src=a,g.listener=f,a.addEventListener)Pt||(O=j),O===void 0&&(O=!1),a.addEventListener(h.toString(),g,O);else if(a.attachEvent)a.attachEvent(ey(h.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return f}function wC(){function a(f){return h.call(a.src,a.listener,f)}const h=EC;return a}function Zg(a,h,f,g,O){if(Array.isArray(h))for(var x=0;x<h.length;x++)Zg(a,h[x],f,g,O);else g=c(g)?!!g.capture:!!g,f=ty(f),a&&a[Ft]?(a=a.i,h=String(h).toString(),h in a.g&&(x=a.g[h],f=fo(x,f,g,O),-1<f&&(q(x[f]),Array.prototype.splice.call(x,f,1),x.length==0&&(delete a.g[h],a.h--)))):a&&(a=jh(a))&&(h=a.g[h.toString()],a=-1,h&&(a=fo(h,f,g,O)),(f=-1<a?h[a]:null)&&$h(f))}function $h(a){if(typeof a!="number"&&a&&!a.da){var h=a.src;if(h&&h[Ft])ho(h.i,a);else{var f=a.type,g=a.proxy;h.removeEventListener?h.removeEventListener(f,g,a.capture):h.detachEvent?h.detachEvent(ey(f),g):h.addListener&&h.removeListener&&h.removeListener(g),(f=jh(h))?(ho(f,a),f.h==0&&(f.src=null,h[Fh]=null)):q(a)}}}function ey(a){return a in Uh?Uh[a]:Uh[a]="on"+a}function EC(a,h){if(a.da)a=!0;else{h=new Qt(h,this);var f=a.listener,g=a.ha||a.src;a.fa&&$h(a),a=f.call(g,h)}return a}function jh(a){return a=a[Fh],a instanceof Se?a:null}var Bh="__closure_events_fn_"+(1e9*Math.random()>>>0);function ty(a){return typeof a=="function"?a:(a[Bh]||(a[Bh]=function(h){return a.handleEvent(h)}),a[Bh])}function Xe(){re.call(this),this.i=new Se(this),this.M=this,this.F=null}C(Xe,re),Xe.prototype[Ft]=!0,Xe.prototype.removeEventListener=function(a,h,f,g){Zg(this,a,h,f,g)};function ht(a,h){var f,g=a.F;if(g)for(f=[];g;g=g.F)f.push(g);if(a=a.M,g=h.type||h,typeof h=="string")h=new Te(h,a);else if(h instanceof Te)h.target=h.target||a;else{var O=h;h=new Te(g,a),T(h,O)}if(O=!0,f)for(var x=f.length-1;0<=x;x--){var j=h.g=f[x];O=Sl(j,g,!0,h)&&O}if(j=h.g=a,O=Sl(j,g,!0,h)&&O,O=Sl(j,g,!1,h)&&O,f)for(x=0;x<f.length;x++)j=h.g=f[x],O=Sl(j,g,!1,h)&&O}Xe.prototype.N=function(){if(Xe.aa.N.call(this),this.i){var a=this.i,h;for(h in a.g){for(var f=a.g[h],g=0;g<f.length;g++)q(f[g]);delete a.g[h],a.h--}}this.F=null},Xe.prototype.K=function(a,h,f,g){return this.i.add(String(a),h,!1,f,g)},Xe.prototype.L=function(a,h,f,g){return this.i.add(String(a),h,!0,f,g)};function Sl(a,h,f,g){if(h=a.i.g[String(h)],!h)return!0;h=h.concat();for(var O=!0,x=0;x<h.length;++x){var j=h[x];if(j&&!j.da&&j.capture==f){var de=j.listener,We=j.ha||j.src;j.fa&&ho(a.i,j),O=de.call(We,g)!==!1&&O}}return O&&!g.defaultPrevented}function ny(a,h,f){if(typeof a=="function")f&&(a=m(a,f));else if(a&&typeof a.handleEvent=="function")a=m(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(h)?-1:l.setTimeout(a,h||0)}function ry(a){a.g=ny(()=>{a.g=null,a.i&&(a.i=!1,ry(a))},a.l);const h=a.h;a.h=null,a.m.apply(null,h)}class IC extends re{constructor(h,f){super(),this.m=h,this.l=f,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:ry(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function po(a){re.call(this),this.h=a,this.g={}}C(po,re);var iy=[];function sy(a){$(a.g,function(h,f){this.g.hasOwnProperty(f)&&$h(h)},a),a.g={}}po.prototype.N=function(){po.aa.N.call(this),sy(this)},po.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var zh=l.JSON.stringify,TC=l.JSON.parse,SC=class{stringify(a){return l.JSON.stringify(a,void 0)}parse(a){return l.JSON.parse(a,void 0)}};function Hh(){}Hh.prototype.h=null;function oy(a){return a.h||(a.h=a.i())}function ay(){}var mo={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Wh(){Te.call(this,"d")}C(Wh,Te);function qh(){Te.call(this,"c")}C(qh,Te);var ii={},ly=null;function Al(){return ly=ly||new Xe}ii.La="serverreachability";function uy(a){Te.call(this,ii.La,a)}C(uy,Te);function go(a){const h=Al();ht(h,new uy(h))}ii.STAT_EVENT="statevent";function cy(a,h){Te.call(this,ii.STAT_EVENT,a),this.stat=h}C(cy,Te);function dt(a){const h=Al();ht(h,new cy(h,a))}ii.Ma="timingevent";function hy(a,h){Te.call(this,ii.Ma,a),this.size=h}C(hy,Te);function yo(a,h){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){a()},h)}function vo(){this.g=!0}vo.prototype.xa=function(){this.g=!1};function AC(a,h,f,g,O,x){a.info(function(){if(a.g)if(x)for(var j="",de=x.split("&"),We=0;We<de.length;We++){var le=de[We].split("=");if(1<le.length){var Ze=le[0];le=le[1];var et=Ze.split("_");j=2<=et.length&&et[1]=="type"?j+(Ze+"="+le+"&"):j+(Ze+"=redacted&")}}else j=null;else j=x;return"XMLHTTP REQ ("+g+") [attempt "+O+"]: "+h+`
`+f+`
`+j})}function CC(a,h,f,g,O,x,j){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+O+"]: "+h+`
`+f+`
`+x+" "+j})}function Gi(a,h,f,g){a.info(function(){return"XMLHTTP TEXT ("+h+"): "+kC(a,f)+(g?" "+g:"")})}function PC(a,h){a.info(function(){return"TIMEOUT: "+h})}vo.prototype.info=function(){};function kC(a,h){if(!a.g)return h;if(!h)return null;try{var f=JSON.parse(h);if(f){for(a=0;a<f.length;a++)if(Array.isArray(f[a])){var g=f[a];if(!(2>g.length)){var O=g[1];if(Array.isArray(O)&&!(1>O.length)){var x=O[0];if(x!="noop"&&x!="stop"&&x!="close")for(var j=1;j<O.length;j++)O[j]=""}}}}return zh(f)}catch{return h}}var Cl={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},dy={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Gh;function Pl(){}C(Pl,Hh),Pl.prototype.g=function(){return new XMLHttpRequest},Pl.prototype.i=function(){return{}},Gh=new Pl;function sr(a,h,f,g){this.j=a,this.i=h,this.l=f,this.R=g||1,this.U=new po(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new fy}function fy(){this.i=null,this.g="",this.h=!1}var py={},Kh={};function Qh(a,h,f){a.L=1,a.v=Nl(bn(h)),a.m=f,a.P=!0,my(a,null)}function my(a,h){a.F=Date.now(),kl(a),a.A=bn(a.v);var f=a.A,g=a.R;Array.isArray(g)||(g=[String(g)]),Ry(f.i,"t",g),a.C=0,f=a.j.J,a.h=new fy,a.g=Gy(a.j,f?h:null,!a.m),0<a.O&&(a.M=new IC(m(a.Y,a,a.g),a.O)),h=a.U,f=a.g,g=a.ca;var O="readystatechange";Array.isArray(O)||(O&&(iy[0]=O.toString()),O=iy);for(var x=0;x<O.length;x++){var j=Xg(f,O[x],g||h.handleEvent,!1,h.h||h);if(!j)break;h.g[j.key]=j}h=a.H?v(a.H):{},a.m?(a.u||(a.u="POST"),h["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,h)):(a.u="GET",a.g.ea(a.A,a.u,null,h)),go(),AC(a.i,a.u,a.A,a.l,a.R,a.m)}sr.prototype.ca=function(a){a=a.target;const h=this.M;h&&Nn(a)==3?h.j():this.Y(a)},sr.prototype.Y=function(a){try{if(a==this.g)e:{const et=Nn(this.g);var h=this.g.Ba();const Yi=this.g.Z();if(!(3>et)&&(et!=3||this.g&&(this.h.h||this.g.oa()||Ly(this.g)))){this.J||et!=4||h==7||(h==8||0>=Yi?go(3):go(2)),Yh(this);var f=this.g.Z();this.X=f;t:if(gy(this)){var g=Ly(this.g);a="";var O=g.length,x=Nn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){si(this),_o(this);var j="";break t}this.h.i=new l.TextDecoder}for(h=0;h<O;h++)this.h.h=!0,a+=this.h.i.decode(g[h],{stream:!(x&&h==O-1)});g.length=0,this.h.g+=a,this.C=0,j=this.h.g}else j=this.g.oa();if(this.o=f==200,CC(this.i,this.u,this.A,this.l,this.R,et,f),this.o){if(this.T&&!this.K){t:{if(this.g){var de,We=this.g;if((de=We.g?We.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(de)){var le=de;break t}}le=null}if(f=le)Gi(this.i,this.l,f,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Jh(this,f);else{this.o=!1,this.s=3,dt(12),si(this),_o(this);break e}}if(this.P){f=!0;let Jt;for(;!this.J&&this.C<j.length;)if(Jt=RC(this,j),Jt==Kh){et==4&&(this.s=4,dt(14),f=!1),Gi(this.i,this.l,null,"[Incomplete Response]");break}else if(Jt==py){this.s=4,dt(15),Gi(this.i,this.l,j,"[Invalid Chunk]"),f=!1;break}else Gi(this.i,this.l,Jt,null),Jh(this,Jt);if(gy(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),et!=4||j.length!=0||this.h.h||(this.s=1,dt(16),f=!1),this.o=this.o&&f,!f)Gi(this.i,this.l,j,"[Invalid Chunked Response]"),si(this),_o(this);else if(0<j.length&&!this.W){this.W=!0;var Ze=this.j;Ze.g==this&&Ze.ba&&!Ze.M&&(Ze.j.info("Great, no buffering proxy detected. Bytes received: "+j.length),rd(Ze),Ze.M=!0,dt(11))}}else Gi(this.i,this.l,j,null),Jh(this,j);et==4&&si(this),this.o&&!this.J&&(et==4?zy(this.j,this):(this.o=!1,kl(this)))}else qC(this.g),f==400&&0<j.indexOf("Unknown SID")?(this.s=3,dt(12)):(this.s=0,dt(13)),si(this),_o(this)}}}catch{}finally{}};function gy(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function RC(a,h){var f=a.C,g=h.indexOf(`
`,f);return g==-1?Kh:(f=Number(h.substring(f,g)),isNaN(f)?py:(g+=1,g+f>h.length?Kh:(h=h.slice(g,g+f),a.C=g+f,h)))}sr.prototype.cancel=function(){this.J=!0,si(this)};function kl(a){a.S=Date.now()+a.I,yy(a,a.I)}function yy(a,h){if(a.B!=null)throw Error("WatchDog timer not null");a.B=yo(m(a.ba,a),h)}function Yh(a){a.B&&(l.clearTimeout(a.B),a.B=null)}sr.prototype.ba=function(){this.B=null;const a=Date.now();0<=a-this.S?(PC(this.i,this.A),this.L!=2&&(go(),dt(17)),si(this),this.s=2,_o(this)):yy(this,this.S-a)};function _o(a){a.j.G==0||a.J||zy(a.j,a)}function si(a){Yh(a);var h=a.M;h&&typeof h.ma=="function"&&h.ma(),a.M=null,sy(a.U),a.g&&(h=a.g,a.g=null,h.abort(),h.ma())}function Jh(a,h){try{var f=a.j;if(f.G!=0&&(f.g==a||Xh(f.h,a))){if(!a.K&&Xh(f.h,a)&&f.G==3){try{var g=f.Da.g.parse(h)}catch{g=null}if(Array.isArray(g)&&g.length==3){var O=g;if(O[0]==0){e:if(!f.u){if(f.g)if(f.g.F+3e3<a.F)Vl(f),Ml(f);else break e;nd(f),dt(18)}}else f.za=O[1],0<f.za-f.T&&37500>O[2]&&f.F&&f.v==0&&!f.C&&(f.C=yo(m(f.Za,f),6e3));if(1>=wy(f.h)&&f.ca){try{f.ca()}catch{}f.ca=void 0}}else ai(f,11)}else if((a.K||f.g==a)&&Vl(f),!y(h))for(O=f.Da.g.parse(h),h=0;h<O.length;h++){let le=O[h];if(f.T=le[0],le=le[1],f.G==2)if(le[0]=="c"){f.K=le[1],f.ia=le[2];const Ze=le[3];Ze!=null&&(f.la=Ze,f.j.info("VER="+f.la));const et=le[4];et!=null&&(f.Aa=et,f.j.info("SVER="+f.Aa));const Yi=le[5];Yi!=null&&typeof Yi=="number"&&0<Yi&&(g=1.5*Yi,f.L=g,f.j.info("backChannelRequestTimeoutMs_="+g)),g=f;const Jt=a.g;if(Jt){const Ul=Jt.g?Jt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ul){var x=g.h;x.g||Ul.indexOf("spdy")==-1&&Ul.indexOf("quic")==-1&&Ul.indexOf("h2")==-1||(x.j=x.l,x.g=new Set,x.h&&(Zh(x,x.h),x.h=null))}if(g.D){const id=Jt.g?Jt.g.getResponseHeader("X-HTTP-Session-Id"):null;id&&(g.ya=id,ye(g.I,g.D,id))}}f.G=3,f.l&&f.l.ua(),f.ba&&(f.R=Date.now()-a.F,f.j.info("Handshake RTT: "+f.R+"ms")),g=f;var j=a;if(g.qa=qy(g,g.J?g.ia:null,g.W),j.K){Ey(g.h,j);var de=j,We=g.L;We&&(de.I=We),de.B&&(Yh(de),kl(de)),g.g=j}else jy(g);0<f.i.length&&Ll(f)}else le[0]!="stop"&&le[0]!="close"||ai(f,7);else f.G==3&&(le[0]=="stop"||le[0]=="close"?le[0]=="stop"?ai(f,7):td(f):le[0]!="noop"&&f.l&&f.l.ta(le),f.v=0)}}go(4)}catch{}}var bC=class{constructor(a,h){this.g=a,this.map=h}};function vy(a){this.l=a||10,l.PerformanceNavigationTiming?(a=l.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function _y(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function wy(a){return a.h?1:a.g?a.g.size:0}function Xh(a,h){return a.h?a.h==h:a.g?a.g.has(h):!1}function Zh(a,h){a.g?a.g.add(h):a.h=h}function Ey(a,h){a.h&&a.h==h?a.h=null:a.g&&a.g.has(h)&&a.g.delete(h)}vy.prototype.cancel=function(){if(this.i=Iy(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Iy(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let h=a.i;for(const f of a.g.values())h=h.concat(f.D);return h}return P(a.i)}function NC(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map<"u"&&a instanceof Map||typeof Set<"u"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var h=[],f=a.length,g=0;g<f;g++)h.push(a[g]);return h}h=[],f=0;for(g in a)h[f++]=a[g];return h}function OC(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map<"u"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set<"u"&&a instanceof Set)){if(u(a)||typeof a=="string"){var h=[];a=a.length;for(var f=0;f<a;f++)h.push(f);return h}h=[],f=0;for(const g in a)h[f++]=g;return h}}}function Ty(a,h){if(a.forEach&&typeof a.forEach=="function")a.forEach(h,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,h,void 0);else for(var f=OC(a),g=NC(a),O=g.length,x=0;x<O;x++)h.call(void 0,g[x],f&&f[x],a)}var Sy=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function DC(a,h){if(a){a=a.split("&");for(var f=0;f<a.length;f++){var g=a[f].indexOf("="),O=null;if(0<=g){var x=a[f].substring(0,g);O=a[f].substring(g+1)}else x=a[f];h(x,O?decodeURIComponent(O.replace(/\+/g," ")):"")}}}function oi(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof oi){this.h=a.h,Rl(this,a.j),this.o=a.o,this.g=a.g,bl(this,a.s),this.l=a.l;var h=a.i,f=new Io;f.i=h.i,h.g&&(f.g=new Map(h.g),f.h=h.h),Ay(this,f),this.m=a.m}else a&&(h=String(a).match(Sy))?(this.h=!1,Rl(this,h[1]||"",!0),this.o=wo(h[2]||""),this.g=wo(h[3]||"",!0),bl(this,h[4]),this.l=wo(h[5]||"",!0),Ay(this,h[6]||"",!0),this.m=wo(h[7]||"")):(this.h=!1,this.i=new Io(null,this.h))}oi.prototype.toString=function(){var a=[],h=this.j;h&&a.push(Eo(h,Cy,!0),":");var f=this.g;return(f||h=="file")&&(a.push("//"),(h=this.o)&&a.push(Eo(h,Cy,!0),"@"),a.push(encodeURIComponent(String(f)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.s,f!=null&&a.push(":",String(f))),(f=this.l)&&(this.g&&f.charAt(0)!="/"&&a.push("/"),a.push(Eo(f,f.charAt(0)=="/"?LC:MC,!0))),(f=this.i.toString())&&a.push("?",f),(f=this.m)&&a.push("#",Eo(f,FC)),a.join("")};function bn(a){return new oi(a)}function Rl(a,h,f){a.j=f?wo(h,!0):h,a.j&&(a.j=a.j.replace(/:$/,""))}function bl(a,h){if(h){if(h=Number(h),isNaN(h)||0>h)throw Error("Bad port number "+h);a.s=h}else a.s=null}function Ay(a,h,f){h instanceof Io?(a.i=h,UC(a.i,a.h)):(f||(h=Eo(h,VC)),a.i=new Io(h,a.h))}function ye(a,h,f){a.i.set(h,f)}function Nl(a){return ye(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function wo(a,h){return a?h?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Eo(a,h,f){return typeof a=="string"?(a=encodeURI(a).replace(h,xC),f&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function xC(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Cy=/[#\/\?@]/g,MC=/[#\?:]/g,LC=/[#\?]/g,VC=/[#\?@]/g,FC=/#/g;function Io(a,h){this.h=this.g=null,this.i=a||null,this.j=!!h}function or(a){a.g||(a.g=new Map,a.h=0,a.i&&DC(a.i,function(h,f){a.add(decodeURIComponent(h.replace(/\+/g," ")),f)}))}t=Io.prototype,t.add=function(a,h){or(this),this.i=null,a=Ki(this,a);var f=this.g.get(a);return f||this.g.set(a,f=[]),f.push(h),this.h+=1,this};function Py(a,h){or(a),h=Ki(a,h),a.g.has(h)&&(a.i=null,a.h-=a.g.get(h).length,a.g.delete(h))}function ky(a,h){return or(a),h=Ki(a,h),a.g.has(h)}t.forEach=function(a,h){or(this),this.g.forEach(function(f,g){f.forEach(function(O){a.call(h,O,g,this)},this)},this)},t.na=function(){or(this);const a=Array.from(this.g.values()),h=Array.from(this.g.keys()),f=[];for(let g=0;g<h.length;g++){const O=a[g];for(let x=0;x<O.length;x++)f.push(h[g])}return f},t.V=function(a){or(this);let h=[];if(typeof a=="string")ky(this,a)&&(h=h.concat(this.g.get(Ki(this,a))));else{a=Array.from(this.g.values());for(let f=0;f<a.length;f++)h=h.concat(a[f])}return h},t.set=function(a,h){return or(this),this.i=null,a=Ki(this,a),ky(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[h]),this.h+=1,this},t.get=function(a,h){return a?(a=this.V(a),0<a.length?String(a[0]):h):h};function Ry(a,h,f){Py(a,h),0<f.length&&(a.i=null,a.g.set(Ki(a,h),P(f)),a.h+=f.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],h=Array.from(this.g.keys());for(var f=0;f<h.length;f++){var g=h[f];const x=encodeURIComponent(String(g)),j=this.V(g);for(g=0;g<j.length;g++){var O=x;j[g]!==""&&(O+="="+encodeURIComponent(String(j[g]))),a.push(O)}}return this.i=a.join("&")};function Ki(a,h){return h=String(h),a.j&&(h=h.toLowerCase()),h}function UC(a,h){h&&!a.j&&(or(a),a.i=null,a.g.forEach(function(f,g){var O=g.toLowerCase();g!=O&&(Py(this,g),Ry(this,O,f))},a)),a.j=h}function $C(a,h){const f=new vo;if(l.Image){const g=new Image;g.onload=w(ar,f,"TestLoadImage: loaded",!0,h,g),g.onerror=w(ar,f,"TestLoadImage: error",!1,h,g),g.onabort=w(ar,f,"TestLoadImage: abort",!1,h,g),g.ontimeout=w(ar,f,"TestLoadImage: timeout",!1,h,g),l.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else h(!1)}function jC(a,h){const f=new vo,g=new AbortController,O=setTimeout(()=>{g.abort(),ar(f,"TestPingServer: timeout",!1,h)},1e4);fetch(a,{signal:g.signal}).then(x=>{clearTimeout(O),x.ok?ar(f,"TestPingServer: ok",!0,h):ar(f,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(O),ar(f,"TestPingServer: error",!1,h)})}function ar(a,h,f,g,O){try{O&&(O.onload=null,O.onerror=null,O.onabort=null,O.ontimeout=null),g(f)}catch{}}function BC(){this.g=new SC}function zC(a,h,f){const g=f||"";try{Ty(a,function(O,x){let j=O;c(O)&&(j=zh(O)),h.push(g+x+"="+encodeURIComponent(j))})}catch(O){throw h.push(g+"type="+encodeURIComponent("_badmap")),O}}function Ol(a){this.l=a.Ub||null,this.j=a.eb||!1}C(Ol,Hh),Ol.prototype.g=function(){return new Dl(this.l,this.j)},Ol.prototype.i=function(a){return function(){return a}}({});function Dl(a,h){Xe.call(this),this.D=a,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}C(Dl,Xe),t=Dl.prototype,t.open=function(a,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=h,this.readyState=1,So(this)},t.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const h={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(h.body=a),(this.D||l).fetch(new Request(this.A,h)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,To(this)),this.readyState=0},t.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,So(this)),this.g&&(this.readyState=3,So(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;by(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function by(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}t.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var h=a.value?a.value:new Uint8Array(0);(h=this.v.decode(h,{stream:!a.done}))&&(this.response=this.responseText+=h)}a.done?To(this):So(this),this.readyState==3&&by(this)}},t.Ra=function(a){this.g&&(this.response=this.responseText=a,To(this))},t.Qa=function(a){this.g&&(this.response=a,To(this))},t.ga=function(){this.g&&To(this)};function To(a){a.readyState=4,a.l=null,a.j=null,a.v=null,So(a)}t.setRequestHeader=function(a,h){this.u.append(a,h)},t.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],h=this.h.entries();for(var f=h.next();!f.done;)f=f.value,a.push(f[0]+": "+f[1]),f=h.next();return a.join(`\r
`)};function So(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Dl.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Ny(a){let h="";return $(a,function(f,g){h+=g,h+=":",h+=f,h+=`\r
`}),h}function ed(a,h,f){e:{for(g in f){var g=!1;break e}g=!0}g||(f=Ny(f),typeof a=="string"?f!=null&&encodeURIComponent(String(f)):ye(a,h,f))}function Re(a){Xe.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}C(Re,Xe);var HC=/^https?$/i,WC=["POST","PUT"];t=Re.prototype,t.Ha=function(a){this.J=a},t.ea=function(a,h,f,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);h=h?h.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Gh.g(),this.v=this.o?oy(this.o):oy(Gh),this.g.onreadystatechange=m(this.Ea,this);try{this.B=!0,this.g.open(h,String(a),!0),this.B=!1}catch(x){Oy(this,x);return}if(a=f||"",f=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var O in g)f.set(O,g[O]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const x of g.keys())f.set(x,g.get(x));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(f.keys()).find(x=>x.toLowerCase()=="content-type"),O=l.FormData&&a instanceof l.FormData,!(0<=Array.prototype.indexOf.call(WC,h,void 0))||g||O||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[x,j]of f)this.g.setRequestHeader(x,j);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{My(this),this.u=!0,this.g.send(a),this.u=!1}catch(x){Oy(this,x)}};function Oy(a,h){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=h,a.m=5,Dy(a),xl(a)}function Dy(a){a.A||(a.A=!0,ht(a,"complete"),ht(a,"error"))}t.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,ht(this,"complete"),ht(this,"abort"),xl(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),xl(this,!0)),Re.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?xy(this):this.bb())},t.bb=function(){xy(this)};function xy(a){if(a.h&&typeof o<"u"&&(!a.v[1]||Nn(a)!=4||a.Z()!=2)){if(a.u&&Nn(a)==4)ny(a.Ea,0,a);else if(ht(a,"readystatechange"),Nn(a)==4){a.h=!1;try{const j=a.Z();e:switch(j){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var f;if(!(f=h)){var g;if(g=j===0){var O=String(a.D).match(Sy)[1]||null;!O&&l.self&&l.self.location&&(O=l.self.location.protocol.slice(0,-1)),g=!HC.test(O?O.toLowerCase():"")}f=g}if(f)ht(a,"complete"),ht(a,"success");else{a.m=6;try{var x=2<Nn(a)?a.g.statusText:""}catch{x=""}a.l=x+" ["+a.Z()+"]",Dy(a)}}finally{xl(a)}}}}function xl(a,h){if(a.g){My(a);const f=a.g,g=a.v[0]?()=>{}:null;a.g=null,a.v=null,h||ht(a,"ready");try{f.onreadystatechange=g}catch{}}}function My(a){a.I&&(l.clearTimeout(a.I),a.I=null)}t.isActive=function(){return!!this.g};function Nn(a){return a.g?a.g.readyState:0}t.Z=function(){try{return 2<Nn(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(a){if(this.g){var h=this.g.responseText;return a&&h.indexOf(a)==0&&(h=h.substring(a.length)),TC(h)}};function Ly(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function qC(a){const h={};a=(a.g&&2<=Nn(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(y(a[g]))continue;var f=k(a[g]);const O=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const x=h[O]||[];h[O]=x,x.push(f)}_(h,function(g){return g.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ao(a,h,f){return f&&f.internalChannelParams&&f.internalChannelParams[a]||h}function Vy(a){this.Aa=0,this.i=[],this.j=new vo,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Ao("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Ao("baseRetryDelayMs",5e3,a),this.cb=Ao("retryDelaySeedMs",1e4,a),this.Wa=Ao("forwardChannelMaxRetries",2,a),this.wa=Ao("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new vy(a&&a.concurrentRequestLimit),this.Da=new BC,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=Vy.prototype,t.la=8,t.G=1,t.connect=function(a,h,f,g){dt(0),this.W=a,this.H=h||{},f&&g!==void 0&&(this.H.OSID=f,this.H.OAID=g),this.F=this.X,this.I=qy(this,null,this.W),Ll(this)};function td(a){if(Fy(a),a.G==3){var h=a.U++,f=bn(a.I);if(ye(f,"SID",a.K),ye(f,"RID",h),ye(f,"TYPE","terminate"),Co(a,f),h=new sr(a,a.j,h),h.L=2,h.v=Nl(bn(f)),f=!1,l.navigator&&l.navigator.sendBeacon)try{f=l.navigator.sendBeacon(h.v.toString(),"")}catch{}!f&&l.Image&&(new Image().src=h.v,f=!0),f||(h.g=Gy(h.j,null),h.g.ea(h.v)),h.F=Date.now(),kl(h)}Wy(a)}function Ml(a){a.g&&(rd(a),a.g.cancel(),a.g=null)}function Fy(a){Ml(a),a.u&&(l.clearTimeout(a.u),a.u=null),Vl(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&l.clearTimeout(a.s),a.s=null)}function Ll(a){if(!_y(a.h)&&!a.s){a.s=!0;var h=a.Ga;Vt||J(),B||(Vt(),B=!0),Y.add(h,a),a.B=0}}function GC(a,h){return wy(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=h.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=yo(m(a.Ga,a,h),Hy(a,a.B)),a.B++,!0)}t.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;const O=new sr(this,this.j,a);let x=this.o;if(this.S&&(x?(x=v(x),T(x,this.S)):x=this.S),this.m!==null||this.O||(O.H=x,x=null),this.P)e:{for(var h=0,f=0;f<this.i.length;f++){t:{var g=this.i[f];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(h+=g,4096<h){h=f;break e}if(h===4096||f===this.i.length-1){h=f+1;break e}}h=1e3}else h=1e3;h=$y(this,O,h),f=bn(this.I),ye(f,"RID",a),ye(f,"CVER",22),this.D&&ye(f,"X-HTTP-Session-Id",this.D),Co(this,f),x&&(this.O?h="headers="+encodeURIComponent(String(Ny(x)))+"&"+h:this.m&&ed(f,this.m,x)),Zh(this.h,O),this.Ua&&ye(f,"TYPE","init"),this.P?(ye(f,"$req",h),ye(f,"SID","null"),O.T=!0,Qh(O,f,null)):Qh(O,f,h),this.G=2}}else this.G==3&&(a?Uy(this,a):this.i.length==0||_y(this.h)||Uy(this))};function Uy(a,h){var f;h?f=h.l:f=a.U++;const g=bn(a.I);ye(g,"SID",a.K),ye(g,"RID",f),ye(g,"AID",a.T),Co(a,g),a.m&&a.o&&ed(g,a.m,a.o),f=new sr(a,a.j,f,a.B+1),a.m===null&&(f.H=a.o),h&&(a.i=h.D.concat(a.i)),h=$y(a,f,1e3),f.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),Zh(a.h,f),Qh(f,g,h)}function Co(a,h){a.H&&$(a.H,function(f,g){ye(h,g,f)}),a.l&&Ty({},function(f,g){ye(h,g,f)})}function $y(a,h,f){f=Math.min(a.i.length,f);var g=a.l?m(a.l.Na,a.l,a):null;e:{var O=a.i;let x=-1;for(;;){const j=["count="+f];x==-1?0<f?(x=O[0].g,j.push("ofs="+x)):x=0:j.push("ofs="+x);let de=!0;for(let We=0;We<f;We++){let le=O[We].g;const Ze=O[We].map;if(le-=x,0>le)x=Math.max(0,O[We].g-100),de=!1;else try{zC(Ze,j,"req"+le+"_")}catch{g&&g(Ze)}}if(de){g=j.join("&");break e}}}return a=a.i.splice(0,f),h.D=a,g}function jy(a){if(!a.g&&!a.u){a.Y=1;var h=a.Fa;Vt||J(),B||(Vt(),B=!0),Y.add(h,a),a.v=0}}function nd(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=yo(m(a.Fa,a),Hy(a,a.v)),a.v++,!0)}t.Fa=function(){if(this.u=null,By(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=yo(m(this.ab,this),a)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,dt(10),Ml(this),By(this))};function rd(a){a.A!=null&&(l.clearTimeout(a.A),a.A=null)}function By(a){a.g=new sr(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var h=bn(a.qa);ye(h,"RID","rpc"),ye(h,"SID",a.K),ye(h,"AID",a.T),ye(h,"CI",a.F?"0":"1"),!a.F&&a.ja&&ye(h,"TO",a.ja),ye(h,"TYPE","xmlhttp"),Co(a,h),a.m&&a.o&&ed(h,a.m,a.o),a.L&&(a.g.I=a.L);var f=a.g;a=a.ia,f.L=1,f.v=Nl(bn(h)),f.m=null,f.P=!0,my(f,a)}t.Za=function(){this.C!=null&&(this.C=null,Ml(this),nd(this),dt(19))};function Vl(a){a.C!=null&&(l.clearTimeout(a.C),a.C=null)}function zy(a,h){var f=null;if(a.g==h){Vl(a),rd(a),a.g=null;var g=2}else if(Xh(a.h,h))f=h.D,Ey(a.h,h),g=1;else return;if(a.G!=0){if(h.o)if(g==1){f=h.m?h.m.length:0,h=Date.now()-h.F;var O=a.B;g=Al(),ht(g,new hy(g,f)),Ll(a)}else jy(a);else if(O=h.s,O==3||O==0&&0<h.X||!(g==1&&GC(a,h)||g==2&&nd(a)))switch(f&&0<f.length&&(h=a.h,h.i=h.i.concat(f)),O){case 1:ai(a,5);break;case 4:ai(a,10);break;case 3:ai(a,6);break;default:ai(a,2)}}}function Hy(a,h){let f=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(f*=2),f*h}function ai(a,h){if(a.j.info("Error code "+h),h==2){var f=m(a.fb,a),g=a.Xa;const O=!g;g=new oi(g||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||Rl(g,"https"),Nl(g),O?$C(g.toString(),f):jC(g.toString(),f)}else dt(2);a.G=0,a.l&&a.l.sa(h),Wy(a),Fy(a)}t.fb=function(a){a?(this.j.info("Successfully pinged google.com"),dt(2)):(this.j.info("Failed to ping google.com"),dt(1))};function Wy(a){if(a.G=0,a.ka=[],a.l){const h=Iy(a.h);(h.length!=0||a.i.length!=0)&&(N(a.ka,h),N(a.ka,a.i),a.h.i.length=0,P(a.i),a.i.length=0),a.l.ra()}}function qy(a,h,f){var g=f instanceof oi?bn(f):new oi(f);if(g.g!="")h&&(g.g=h+"."+g.g),bl(g,g.s);else{var O=l.location;g=O.protocol,h=h?h+"."+O.hostname:O.hostname,O=+O.port;var x=new oi(null);g&&Rl(x,g),h&&(x.g=h),O&&bl(x,O),f&&(x.l=f),g=x}return f=a.D,h=a.ya,f&&h&&ye(g,f,h),ye(g,"VER",a.la),Co(a,g),g}function Gy(a,h,f){if(h&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return h=a.Ca&&!a.pa?new Re(new Ol({eb:f})):new Re(a.pa),h.Ha(a.J),h}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function Ky(){}t=Ky.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function Fl(){}Fl.prototype.g=function(a,h){return new kt(a,h)};function kt(a,h){Xe.call(this),this.g=new Vy(h),this.l=a,this.h=h&&h.messageUrlParams||null,a=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(a?a["X-WebChannel-Content-Type"]=h.messageContentType:a={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.va&&(a?a["X-WebChannel-Client-Profile"]=h.va:a={"X-WebChannel-Client-Profile":h.va}),this.g.S=a,(a=h&&h.Sb)&&!y(a)&&(this.g.m=a),this.v=h&&h.supportsCrossDomainXhr||!1,this.u=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!y(h)&&(this.g.D=h,a=this.h,a!==null&&h in a&&(a=this.h,h in a&&delete a[h])),this.j=new Qi(this)}C(kt,Xe),kt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},kt.prototype.close=function(){td(this.g)},kt.prototype.o=function(a){var h=this.g;if(typeof a=="string"){var f={};f.__data__=a,a=f}else this.u&&(f={},f.__data__=zh(a),a=f);h.i.push(new bC(h.Ya++,a)),h.G==3&&Ll(h)},kt.prototype.N=function(){this.g.l=null,delete this.j,td(this.g),delete this.g,kt.aa.N.call(this)};function Qy(a){Wh.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var h=a.__sm__;if(h){e:{for(const f in h){a=f;break e}a=void 0}(this.i=a)&&(a=this.i,h=h!==null&&a in h?h[a]:void 0),this.data=h}else this.data=a}C(Qy,Wh);function Yy(){qh.call(this),this.status=1}C(Yy,qh);function Qi(a){this.g=a}C(Qi,Ky),Qi.prototype.ua=function(){ht(this.g,"a")},Qi.prototype.ta=function(a){ht(this.g,new Qy(a))},Qi.prototype.sa=function(a){ht(this.g,new Yy)},Qi.prototype.ra=function(){ht(this.g,"b")},Fl.prototype.createWebChannel=Fl.prototype.g,kt.prototype.send=kt.prototype.o,kt.prototype.open=kt.prototype.m,kt.prototype.close=kt.prototype.close,O0=function(){return new Fl},N0=function(){return Al()},b0=ii,lp={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Cl.NO_ERROR=0,Cl.TIMEOUT=8,Cl.HTTP_ERROR=6,Su=Cl,dy.COMPLETE="complete",R0=dy,ay.EventType=mo,mo.OPEN="a",mo.CLOSE="b",mo.ERROR="c",mo.MESSAGE="d",Xe.prototype.listen=Xe.prototype.K,Wo=ay,Re.prototype.listenOnce=Re.prototype.L,Re.prototype.getLastError=Re.prototype.Ka,Re.prototype.getLastErrorCode=Re.prototype.Ba,Re.prototype.getStatus=Re.prototype.Z,Re.prototype.getResponseJson=Re.prototype.Oa,Re.prototype.getResponseText=Re.prototype.oa,Re.prototype.send=Re.prototype.ea,Re.prototype.setWithCredentials=Re.prototype.Ha,k0=Re}).apply(typeof ru<"u"?ru:typeof self<"u"?self:typeof window<"u"?window:{});const A_="@firebase/firestore",C_="4.8.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}it.UNAUTHENTICATED=new it(null),it.GOOGLE_CREDENTIALS=new it("google-credentials-uid"),it.FIRST_PARTY=new it("first-party-uid"),it.MOCK_USER=new it("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ro="11.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bi=new Lm("@firebase/firestore");function es(){return bi.logLevel}function H(t,...e){if(bi.logLevel<=ie.DEBUG){const n=e.map(Fm);bi.debug(`Firestore (${ro}): ${t}`,...n)}}function Yn(t,...e){if(bi.logLevel<=ie.ERROR){const n=e.map(Fm);bi.error(`Firestore (${ro}): ${t}`,...n)}}function Br(t,...e){if(bi.logLevel<=ie.WARN){const n=e.map(Fm);bi.warn(`Firestore (${ro}): ${t}`,...n)}}function Fm(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(n){return JSON.stringify(n)}(t)}catch{return t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Q(t,e,n){let r="Unexpected state";typeof e=="string"?r=e:n=e,D0(t,r,n)}function D0(t,e,n){let r=`FIRESTORE (${ro}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{r+=" CONTEXT: "+JSON.stringify(n)}catch{r+=" CONTEXT: "+n}throw Yn(r),new Error(r)}function ue(t,e,n,r){let i="Unexpected state";typeof n=="string"?i=n:r=n,t||D0(e,i,r)}function ee(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class z extends rr{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lr{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x0{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class lO{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(it.UNAUTHENTICATED))}shutdown(){}}class uO{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class cO{constructor(e){this.t=e,this.currentUser=it.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){ue(this.o===void 0,42304);let r=this.i;const i=u=>this.i!==r?(r=this.i,n(u)):Promise.resolve();let s=new Lr;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Lr,e.enqueueRetryable(()=>i(this.currentUser))};const o=()=>{const u=s;e.enqueueRetryable(async()=>{await u.promise,await i(this.currentUser)})},l=u=>{H("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>l(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?l(u):(H("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Lr)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(H("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(ue(typeof r.accessToken=="string",31837,{l:r}),new x0(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ue(e===null||typeof e=="string",2055,{h:e}),new it(e)}}class hO{constructor(e,n,r){this.P=e,this.T=n,this.I=r,this.type="FirstParty",this.user=it.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class dO{constructor(e,n,r){this.P=e,this.T=n,this.I=r}getToken(){return Promise.resolve(new hO(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(it.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class P_{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class fO{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Bt(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){ue(this.o===void 0,3512);const r=s=>{s.error!=null&&H("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.m;return this.m=s.token,H("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{H("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.V.getImmediate({optional:!0});s?i(s):H("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new P_(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(ue(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new P_(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pO(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M0(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Um{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=pO(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<n&&(r+=e.charAt(i[s]%62))}return r}}function te(t,e){return t<e?-1:t>e?1:0}function up(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=t.codePointAt(n),i=e.codePointAt(n);if(r!==i){if(r<128&&i<128)return te(r,i);{const s=M0(),o=mO(s.encode(k_(t,n)),s.encode(k_(e,n)));return o!==0?o:te(r,i)}}n+=r>65535?2:1}return te(t.length,e.length)}function k_(t,e){return t.codePointAt(e)>65535?t.substring(e,e+2):t.substring(e,e+1)}function mO(t,e){for(let n=0;n<t.length&&n<e.length;++n)if(t[n]!==e[n])return te(t[n],e[n]);return te(t.length,e.length)}function Bs(t,e,n){return t.length===e.length&&t.every((r,i)=>n(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R_="__name__";class pn{constructor(e,n,r){n===void 0?n=0:n>e.length&&Q(637,{offset:n,range:e.length}),r===void 0?r=e.length-n:r>e.length-n&&Q(1746,{length:r,range:e.length-n}),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return pn.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof pn?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let i=0;i<r;i++){const s=pn.compareSegments(e.get(i),n.get(i));if(s!==0)return s}return te(e.length,n.length)}static compareSegments(e,n){const r=pn.isNumericId(e),i=pn.isNumericId(n);return r&&!i?-1:!r&&i?1:r&&i?pn.extractNumericId(e).compare(pn.extractNumericId(n)):up(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Mr.fromString(e.substring(4,e.length-2))}}class pe extends pn{construct(e,n,r){return new pe(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new z(M.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(i=>i.length>0))}return new pe(n)}static emptyPath(){return new pe([])}}const gO=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ke extends pn{construct(e,n,r){return new Ke(e,n,r)}static isValidIdentifier(e){return gO.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ke.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===R_}static keyField(){return new Ke([R_])}static fromServerFormat(e){const n=[];let r="",i=0;const s=()=>{if(r.length===0)throw new z(M.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let o=!1;for(;i<e.length;){const l=e[i];if(l==="\\"){if(i+1===e.length)throw new z(M.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new z(M.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,i+=2}else l==="`"?(o=!o,i++):l!=="."||o?(r+=l,i++):(s(),i++)}if(s(),o)throw new z(M.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ke(n)}static emptyPath(){return new Ke([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{constructor(e){this.path=e}static fromPath(e){return new G(pe.fromString(e))}static fromName(e){return new G(pe.fromString(e).popFirst(5))}static empty(){return new G(pe.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&pe.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return pe.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new G(new pe(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function L0(t,e,n){if(!n)throw new z(M.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function yO(t,e,n,r){if(e===!0&&r===!0)throw new z(M.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function b_(t){if(!G.isDocumentKey(t))throw new z(M.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function N_(t){if(G.isDocumentKey(t))throw new z(M.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function V0(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function ah(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":Q(12329,{type:typeof t})}function sn(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new z(M.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=ah(t);throw new z(M.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function vO(t,e){if(e<=0)throw new z(M.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fe(t,e){const n={typeString:t};return e&&(n.value=e),n}function al(t,e){if(!V0(t))throw new z(M.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in t)){n=`JSON missing required field: '${r}'`;break}const o=t[r];if(i&&typeof o!==i){n=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&o!==s.value){n=`Expected '${r}' field to equal '${s.value}'`;break}}if(n)throw new z(M.INVALID_ARGUMENT,n);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const O_=-62135596800,D_=1e6;class _e{static now(){return _e.fromMillis(Date.now())}static fromDate(e){return _e.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor((e-1e3*n)*D_);return new _e(n,r)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new z(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new z(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<O_)throw new z(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new z(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/D_}_compareTo(e){return this.seconds===e.seconds?te(this.nanoseconds,e.nanoseconds):te(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:_e._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(al(e,_e._jsonSchema))return new _e(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-O_;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}_e._jsonSchemaVersion="firestore/timestamp/1.0",_e._jsonSchema={type:Fe("string",_e._jsonSchemaVersion),seconds:Fe("number"),nanoseconds:Fe("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z{static fromTimestamp(e){return new Z(e)}static min(){return new Z(new _e(0,0))}static max(){return new Z(new _e(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const La=-1;function _O(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,i=Z.fromTimestamp(r===1e9?new _e(n+1,0):new _e(n,r));return new zr(i,G.empty(),e)}function wO(t){return new zr(t.readTime,t.key,La)}class zr{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new zr(Z.min(),G.empty(),La)}static max(){return new zr(Z.max(),G.empty(),La)}}function EO(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=G.comparator(t.documentKey,e.documentKey),n!==0?n:te(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IO="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class TO{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function io(t){if(t.code!==M.FAILED_PRECONDITION||t.message!==IO)throw t;H("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&Q(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new V((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(n,s).next(r,i)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof V?n:V.resolve(n)}catch(n){return V.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):V.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):V.reject(n)}static resolve(e){return new V((n,r)=>{n(e)})}static reject(e){return new V((n,r)=>{r(e)})}static waitFor(e){return new V((n,r)=>{let i=0,s=0,o=!1;e.forEach(l=>{++i,l.next(()=>{++s,o&&s===i&&n()},u=>r(u))}),o=!0,s===i&&n()})}static or(e){let n=V.resolve(!1);for(const r of e)n=n.next(i=>i?V.resolve(i):r());return n}static forEach(e,n){const r=[];return e.forEach((i,s)=>{r.push(n.call(this,i,s))}),this.waitFor(r)}static mapArray(e,n){return new V((r,i)=>{const s=e.length,o=new Array(s);let l=0;for(let u=0;u<s;u++){const c=u;n(e[c]).next(d=>{o[c]=d,++l,l===s&&r(o)},d=>i(d))}})}static doWhile(e,n){return new V((r,i)=>{const s=()=>{e()===!0?n().next(()=>{s()},i):r()};s()})}}function SO(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function so(t){return t.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lh{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this._e(r),this.ae=r=>n.writeSequenceNumber(r))}_e(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ae&&this.ae(e),e}}lh.ue=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $m=-1;function uh(t){return t==null}function dc(t){return t===0&&1/t==-1/0}function AO(t){return typeof t=="number"&&Number.isInteger(t)&&!dc(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F0="";function CO(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=x_(e)),e=PO(t.get(n),e);return x_(e)}function PO(t,e){let n=e;const r=t.length;for(let i=0;i<r;i++){const s=t.charAt(i);switch(s){case"\0":n+="";break;case F0:n+="";break;default:n+=s}}return n}function x_(t){return t+F0+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M_(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Zr(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function U0(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ke{constructor(e,n){this.comparator=e,this.root=n||Ge.EMPTY}insert(e,n){return new ke(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,Ge.BLACK,null,null))}remove(e){return new ke(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ge.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return n+r.left.size;i<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new iu(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new iu(this.root,e,this.comparator,!1)}getReverseIterator(){return new iu(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new iu(this.root,e,this.comparator,!0)}}class iu{constructor(e,n,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?r(e.key,n):1,n&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ge{constructor(e,n,r,i,s){this.key=e,this.value=n,this.color=r??Ge.RED,this.left=i??Ge.EMPTY,this.right=s??Ge.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,i,s){return new Ge(e??this.key,n??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,n,r),null):s===0?i.copy(null,n,null,null,null):i.copy(null,null,null,null,i.right.insert(e,n,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return Ge.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,i=this;if(n(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,n),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),n(e,i.key)===0){if(i.right.isEmpty())return Ge.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,n))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ge.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ge.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Q(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Q(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw Q(27949);return e+(this.isRed()?0:1)}}Ge.EMPTY=null,Ge.RED=!0,Ge.BLACK=!1;Ge.EMPTY=new class{constructor(){this.size=0}get key(){throw Q(57766)}get value(){throw Q(16141)}get color(){throw Q(16727)}get left(){throw Q(29726)}get right(){throw Q(36894)}copy(e,n,r,i,s){return this}insert(e,n,r){return new Ge(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class je{constructor(e){this.comparator=e,this.data=new ke(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;n(i.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new L_(this.data.getIterator())}getIteratorFrom(e){return new L_(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof je)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new je(this.comparator);return n.data=e,n}}class L_{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(e){this.fields=e,e.sort(Ke.comparator)}static empty(){return new Ot([])}unionWith(e){let n=new je(Ke.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new Ot(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return Bs(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $0 extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Je{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new $0("Invalid base64 string: "+s):s}}(e);return new Je(n)}static fromUint8Array(e){const n=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new Je(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let i=0;i<n.length;i++)r[i]=n.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return te(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Je.EMPTY_BYTE_STRING=new Je("");const kO=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Hr(t){if(ue(!!t,39018),typeof t=="string"){let e=0;const n=kO.exec(t);if(ue(!!n,46558,{timestamp:t}),n[1]){let i=n[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Oe(t.seconds),nanos:Oe(t.nanos)}}function Oe(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Wr(t){return typeof t=="string"?Je.fromBase64String(t):Je.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const j0="server_timestamp",B0="__type__",z0="__previous_value__",H0="__local_write_time__";function jm(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{})[B0])===null||n===void 0?void 0:n.stringValue)===j0}function ch(t){const e=t.mapValue.fields[z0];return jm(e)?ch(e):e}function Va(t){const e=Hr(t.mapValue.fields[H0].timestampValue);return new _e(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RO{constructor(e,n,r,i,s,o,l,u,c,d){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=u,this.useFetchStreams=c,this.isUsingEmulator=d}}const fc="(default)";class Fa{constructor(e,n){this.projectId=e,this.database=n||fc}static empty(){return new Fa("","")}get isDefaultDatabase(){return this.database===fc}isEqual(e){return e instanceof Fa&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const W0="__type__",bO="__max__",su={mapValue:{}},q0="__vector__",pc="value";function qr(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?jm(t)?4:OO(t)?9007199254740991:NO(t)?10:11:Q(28295,{value:t})}function Pn(t,e){if(t===e)return!0;const n=qr(t);if(n!==qr(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Va(t).isEqual(Va(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const o=Hr(i.timestampValue),l=Hr(s.timestampValue);return o.seconds===l.seconds&&o.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(i,s){return Wr(i.bytesValue).isEqual(Wr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(i,s){return Oe(i.geoPointValue.latitude)===Oe(s.geoPointValue.latitude)&&Oe(i.geoPointValue.longitude)===Oe(s.geoPointValue.longitude)}(t,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return Oe(i.integerValue)===Oe(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const o=Oe(i.doubleValue),l=Oe(s.doubleValue);return o===l?dc(o)===dc(l):isNaN(o)&&isNaN(l)}return!1}(t,e);case 9:return Bs(t.arrayValue.values||[],e.arrayValue.values||[],Pn);case 10:case 11:return function(i,s){const o=i.mapValue.fields||{},l=s.mapValue.fields||{};if(M_(o)!==M_(l))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(l[u]===void 0||!Pn(o[u],l[u])))return!1;return!0}(t,e);default:return Q(52216,{left:t})}}function Ua(t,e){return(t.values||[]).find(n=>Pn(n,e))!==void 0}function zs(t,e){if(t===e)return 0;const n=qr(t),r=qr(e);if(n!==r)return te(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return te(t.booleanValue,e.booleanValue);case 2:return function(s,o){const l=Oe(s.integerValue||s.doubleValue),u=Oe(o.integerValue||o.doubleValue);return l<u?-1:l>u?1:l===u?0:isNaN(l)?isNaN(u)?0:-1:1}(t,e);case 3:return V_(t.timestampValue,e.timestampValue);case 4:return V_(Va(t),Va(e));case 5:return up(t.stringValue,e.stringValue);case 6:return function(s,o){const l=Wr(s),u=Wr(o);return l.compareTo(u)}(t.bytesValue,e.bytesValue);case 7:return function(s,o){const l=s.split("/"),u=o.split("/");for(let c=0;c<l.length&&c<u.length;c++){const d=te(l[c],u[c]);if(d!==0)return d}return te(l.length,u.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,o){const l=te(Oe(s.latitude),Oe(o.latitude));return l!==0?l:te(Oe(s.longitude),Oe(o.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return F_(t.arrayValue,e.arrayValue);case 10:return function(s,o){var l,u,c,d;const p=s.fields||{},m=o.fields||{},w=(l=p[pc])===null||l===void 0?void 0:l.arrayValue,C=(u=m[pc])===null||u===void 0?void 0:u.arrayValue,P=te(((c=w==null?void 0:w.values)===null||c===void 0?void 0:c.length)||0,((d=C==null?void 0:C.values)===null||d===void 0?void 0:d.length)||0);return P!==0?P:F_(w,C)}(t.mapValue,e.mapValue);case 11:return function(s,o){if(s===su.mapValue&&o===su.mapValue)return 0;if(s===su.mapValue)return 1;if(o===su.mapValue)return-1;const l=s.fields||{},u=Object.keys(l),c=o.fields||{},d=Object.keys(c);u.sort(),d.sort();for(let p=0;p<u.length&&p<d.length;++p){const m=up(u[p],d[p]);if(m!==0)return m;const w=zs(l[u[p]],c[d[p]]);if(w!==0)return w}return te(u.length,d.length)}(t.mapValue,e.mapValue);default:throw Q(23264,{le:n})}}function V_(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return te(t,e);const n=Hr(t),r=Hr(e),i=te(n.seconds,r.seconds);return i!==0?i:te(n.nanos,r.nanos)}function F_(t,e){const n=t.values||[],r=e.values||[];for(let i=0;i<n.length&&i<r.length;++i){const s=zs(n[i],r[i]);if(s)return s}return te(n.length,r.length)}function Hs(t){return cp(t)}function cp(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=Hr(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Wr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return G.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",i=!0;for(const s of n.values||[])i?i=!1:r+=",",r+=cp(s);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let i="{",s=!0;for(const o of r)s?s=!1:i+=",",i+=`${o}:${cp(n.fields[o])}`;return i+"}"}(t.mapValue):Q(61005,{value:t})}function Au(t){switch(qr(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=ch(t);return e?16+Au(e):16;case 5:return 2*t.stringValue.length;case 6:return Wr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,s)=>i+Au(s),0)}(t.arrayValue);case 10:case 11:return function(r){let i=0;return Zr(r.fields,(s,o)=>{i+=s.length+Au(o)}),i}(t.mapValue);default:throw Q(13486,{value:t})}}function U_(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function hp(t){return!!t&&"integerValue"in t}function Bm(t){return!!t&&"arrayValue"in t}function $_(t){return!!t&&"nullValue"in t}function j_(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function Cu(t){return!!t&&"mapValue"in t}function NO(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{})[W0])===null||n===void 0?void 0:n.stringValue)===q0}function la(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return Zr(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=la(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=la(t.arrayValue.values[n]);return e}return Object.assign({},t)}function OO(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===bO}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt{constructor(e){this.value=e}static empty(){return new wt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!Cu(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=la(n)}setAll(e){let n=Ke.emptyPath(),r={},i=[];e.forEach((o,l)=>{if(!n.isImmediateParentOf(l)){const u=this.getFieldsMap(n);this.applyChanges(u,r,i),r={},i=[],n=l.popLast()}o?r[l.lastSegment()]=la(o):i.push(l.lastSegment())});const s=this.getFieldsMap(n);this.applyChanges(s,r,i)}delete(e){const n=this.field(e.popLast());Cu(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return Pn(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=n.mapValue.fields[e.get(r)];Cu(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=i),n=i}return n.mapValue.fields}applyChanges(e,n,r){Zr(n,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new wt(la(this.value))}}function G0(t){const e=[];return Zr(t.fields,(n,r)=>{const i=new Ke([n]);if(Cu(r)){const s=G0(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)}),new Ot(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot{constructor(e,n,r,i,s,o,l){this.key=e,this.documentType=n,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=l}static newInvalidDocument(e){return new ot(e,0,Z.min(),Z.min(),Z.min(),wt.empty(),0)}static newFoundDocument(e,n,r,i){return new ot(e,1,n,Z.min(),r,i,0)}static newNoDocument(e,n){return new ot(e,2,n,Z.min(),Z.min(),wt.empty(),0)}static newUnknownDocument(e,n){return new ot(e,3,n,Z.min(),Z.min(),wt.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(Z.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=wt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=wt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=Z.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof ot&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new ot(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mc{constructor(e,n){this.position=e,this.inclusive=n}}function B_(t,e,n){let r=0;for(let i=0;i<t.position.length;i++){const s=e[i],o=t.position[i];if(s.field.isKeyField()?r=G.comparator(G.fromName(o.referenceValue),n.key):r=zs(o,n.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function z_(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!Pn(t.position[n],e.position[n]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $a{constructor(e,n="asc"){this.field=e,this.dir=n}}function DO(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K0{}class Ve extends K0{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new MO(e,n,r):n==="array-contains"?new FO(e,r):n==="in"?new UO(e,r):n==="not-in"?new $O(e,r):n==="array-contains-any"?new jO(e,r):new Ve(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new LO(e,r):new VO(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(zs(n,this.value)):n!==null&&qr(this.value)===qr(n)&&this.matchesComparison(zs(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Q(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class un extends K0{constructor(e,n){super(),this.filters=e,this.op=n,this.he=null}static create(e,n){return new un(e,n)}matches(e){return Q0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.he!==null||(this.he=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function Q0(t){return t.op==="and"}function Y0(t){return xO(t)&&Q0(t)}function xO(t){for(const e of t.filters)if(e instanceof un)return!1;return!0}function dp(t){if(t instanceof Ve)return t.field.canonicalString()+t.op.toString()+Hs(t.value);if(Y0(t))return t.filters.map(e=>dp(e)).join(",");{const e=t.filters.map(n=>dp(n)).join(",");return`${t.op}(${e})`}}function J0(t,e){return t instanceof Ve?function(r,i){return i instanceof Ve&&r.op===i.op&&r.field.isEqual(i.field)&&Pn(r.value,i.value)}(t,e):t instanceof un?function(r,i){return i instanceof un&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,o,l)=>s&&J0(o,i.filters[l]),!0):!1}(t,e):void Q(19439)}function X0(t){return t instanceof Ve?function(n){return`${n.field.canonicalString()} ${n.op} ${Hs(n.value)}`}(t):t instanceof un?function(n){return n.op.toString()+" {"+n.getFilters().map(X0).join(" ,")+"}"}(t):"Filter"}class MO extends Ve{constructor(e,n,r){super(e,n,r),this.key=G.fromName(r.referenceValue)}matches(e){const n=G.comparator(e.key,this.key);return this.matchesComparison(n)}}class LO extends Ve{constructor(e,n){super(e,"in",n),this.keys=Z0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class VO extends Ve{constructor(e,n){super(e,"not-in",n),this.keys=Z0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function Z0(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>G.fromName(r.referenceValue))}class FO extends Ve{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return Bm(n)&&Ua(n.arrayValue,this.value)}}class UO extends Ve{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&Ua(this.value.arrayValue,n)}}class $O extends Ve{constructor(e,n){super(e,"not-in",n)}matches(e){if(Ua(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Ua(this.value.arrayValue,n)}}class jO extends Ve{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!Bm(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>Ua(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BO{constructor(e,n=null,r=[],i=[],s=null,o=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=l,this.Pe=null}}function H_(t,e=null,n=[],r=[],i=null,s=null,o=null){return new BO(t,e,n,r,i,s,o)}function zm(t){const e=ee(t);if(e.Pe===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>dp(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),uh(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>Hs(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>Hs(r)).join(",")),e.Pe=n}return e.Pe}function Hm(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!DO(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!J0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!z_(t.startAt,e.startAt)&&z_(t.endAt,e.endAt)}function fp(t){return G.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oo{constructor(e,n=null,r=[],i=[],s=null,o="F",l=null,u=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=l,this.endAt=u,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function zO(t,e,n,r,i,s,o,l){return new oo(t,e,n,r,i,s,o,l)}function Wm(t){return new oo(t)}function W_(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function eS(t){return t.collectionGroup!==null}function ua(t){const e=ee(t);if(e.Te===null){e.Te=[];const n=new Set;for(const s of e.explicitOrderBy)e.Te.push(s),n.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let l=new je(Ke.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(c=>{c.isInequality()&&(l=l.add(c.field))})}),l})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Te.push(new $a(s,r))}),n.has(Ke.keyField().canonicalString())||e.Te.push(new $a(Ke.keyField(),r))}return e.Te}function _n(t){const e=ee(t);return e.Ie||(e.Ie=HO(e,ua(t))),e.Ie}function HO(t,e){if(t.limitType==="F")return H_(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new $a(i.field,s)});const n=t.endAt?new mc(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new mc(t.startAt.position,t.startAt.inclusive):null;return H_(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function pp(t,e){const n=t.filters.concat([e]);return new oo(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function gc(t,e,n){return new oo(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function hh(t,e){return Hm(_n(t),_n(e))&&t.limitType===e.limitType}function tS(t){return`${zm(_n(t))}|lt:${t.limitType}`}function ts(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(i=>X0(i)).join(", ")}]`),uh(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(i=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(i)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(i=>Hs(i)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(i=>Hs(i)).join(",")),`Target(${r})`}(_n(t))}; limitType=${t.limitType})`}function dh(t,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):G.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(t,e)&&function(r,i){for(const s of ua(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(t,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(t,e)&&function(r,i){return!(r.startAt&&!function(o,l,u){const c=B_(o,l,u);return o.inclusive?c<=0:c<0}(r.startAt,ua(r),i)||r.endAt&&!function(o,l,u){const c=B_(o,l,u);return o.inclusive?c>=0:c>0}(r.endAt,ua(r),i))}(t,e)}function WO(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function nS(t){return(e,n)=>{let r=!1;for(const i of ua(t)){const s=qO(i,e,n);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function qO(t,e,n){const r=t.field.isKeyField()?G.comparator(e.key,n.key):function(s,o,l){const u=o.data.field(s),c=l.data.field(s);return u!==null&&c!==null?zs(u,c):Q(42886)}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return Q(19790,{direction:t.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zi{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,n]);i.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[n]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Zr(this.inner,(n,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return U0(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GO=new ke(G.comparator);function Jn(){return GO}const rS=new ke(G.comparator);function qo(...t){let e=rS;for(const n of t)e=e.insert(n.key,n);return e}function iS(t){let e=rS;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function gi(){return ca()}function sS(){return ca()}function ca(){return new zi(t=>t.toString(),(t,e)=>t.isEqual(e))}const KO=new ke(G.comparator),QO=new je(G.comparator);function se(...t){let e=QO;for(const n of t)e=e.add(n);return e}const YO=new je(te);function JO(){return YO}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qm(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:dc(e)?"-0":e}}function oS(t){return{integerValue:""+t}}function XO(t,e){return AO(e)?oS(e):qm(t,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fh{constructor(){this._=void 0}}function ZO(t,e,n){return t instanceof ja?function(i,s){const o={fields:{[B0]:{stringValue:j0},[H0]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&jm(s)&&(s=ch(s)),s&&(o.fields[z0]=s),{mapValue:o}}(n,e):t instanceof Ba?lS(t,e):t instanceof za?uS(t,e):function(i,s){const o=aS(i,s),l=q_(o)+q_(i.Ee);return hp(o)&&hp(i.Ee)?oS(l):qm(i.serializer,l)}(t,e)}function eD(t,e,n){return t instanceof Ba?lS(t,e):t instanceof za?uS(t,e):n}function aS(t,e){return t instanceof yc?function(r){return hp(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class ja extends fh{}class Ba extends fh{constructor(e){super(),this.elements=e}}function lS(t,e){const n=cS(e);for(const r of t.elements)n.some(i=>Pn(i,r))||n.push(r);return{arrayValue:{values:n}}}class za extends fh{constructor(e){super(),this.elements=e}}function uS(t,e){let n=cS(e);for(const r of t.elements)n=n.filter(i=>!Pn(i,r));return{arrayValue:{values:n}}}class yc extends fh{constructor(e,n){super(),this.serializer=e,this.Ee=n}}function q_(t){return Oe(t.integerValue||t.doubleValue)}function cS(t){return Bm(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tD{constructor(e,n){this.field=e,this.transform=n}}function nD(t,e){return t.field.isEqual(e.field)&&function(r,i){return r instanceof Ba&&i instanceof Ba||r instanceof za&&i instanceof za?Bs(r.elements,i.elements,Pn):r instanceof yc&&i instanceof yc?Pn(r.Ee,i.Ee):r instanceof ja&&i instanceof ja}(t.transform,e.transform)}class rD{constructor(e,n){this.version=e,this.transformResults=n}}class on{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new on}static exists(e){return new on(void 0,e)}static updateTime(e){return new on(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Pu(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class ph{}function hS(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new fS(t.key,on.none()):new ll(t.key,t.data,on.none());{const n=t.data,r=wt.empty();let i=new je(Ke.comparator);for(let s of e.fields)if(!i.has(s)){let o=n.field(s);o===null&&s.length>1&&(s=s.popLast(),o=n.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new ei(t.key,r,new Ot(i.toArray()),on.none())}}function iD(t,e,n){t instanceof ll?function(i,s,o){const l=i.value.clone(),u=K_(i.fieldTransforms,s,o.transformResults);l.setAll(u),s.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(t,e,n):t instanceof ei?function(i,s,o){if(!Pu(i.precondition,s))return void s.convertToUnknownDocument(o.version);const l=K_(i.fieldTransforms,s,o.transformResults),u=s.data;u.setAll(dS(i)),u.setAll(l),s.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(t,e,n):function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,n)}function ha(t,e,n,r){return t instanceof ll?function(s,o,l,u){if(!Pu(s.precondition,o))return l;const c=s.value.clone(),d=Q_(s.fieldTransforms,u,o);return c.setAll(d),o.convertToFoundDocument(o.version,c).setHasLocalMutations(),null}(t,e,n,r):t instanceof ei?function(s,o,l,u){if(!Pu(s.precondition,o))return l;const c=Q_(s.fieldTransforms,u,o),d=o.data;return d.setAll(dS(s)),d.setAll(c),o.convertToFoundDocument(o.version,d).setHasLocalMutations(),l===null?null:l.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(s,o,l){return Pu(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):l}(t,e,n)}function sD(t,e){let n=null;for(const r of t.fieldTransforms){const i=e.data.field(r.field),s=aS(r.transform,i||null);s!=null&&(n===null&&(n=wt.empty()),n.set(r.field,s))}return n||null}function G_(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&Bs(r,i,(s,o)=>nD(s,o))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class ll extends ph{constructor(e,n,r,i=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class ei extends ph{constructor(e,n,r,i,s=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function dS(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function K_(t,e,n){const r=new Map;ue(t.length===n.length,32656,{Ae:n.length,Re:t.length});for(let i=0;i<n.length;i++){const s=t[i],o=s.transform,l=e.data.field(s.field);r.set(s.field,eD(o,l,n[i]))}return r}function Q_(t,e,n){const r=new Map;for(const i of t){const s=i.transform,o=n.data.field(i.field);r.set(i.field,ZO(s,o,e))}return r}class fS extends ph{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class oD extends ph{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aD{constructor(e,n,r,i){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&iD(s,e,r[i])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=ha(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=ha(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=sS();return this.mutations.forEach(i=>{const s=e.get(i.key),o=s.overlayedDocument;let l=this.applyToLocalView(o,s.mutatedFields);l=n.has(i.key)?null:l;const u=hS(o,l);u!==null&&r.set(i.key,u),o.isValidDocument()||o.convertToNoDocument(Z.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),se())}isEqual(e){return this.batchId===e.batchId&&Bs(this.mutations,e.mutations,(n,r)=>G_(n,r))&&Bs(this.baseMutations,e.baseMutations,(n,r)=>G_(n,r))}}class Gm{constructor(e,n,r,i){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=i}static from(e,n,r){ue(e.mutations.length===r.length,58842,{Ve:e.mutations.length,me:r.length});let i=function(){return KO}();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new Gm(e,n,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lD{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uD{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Me,oe;function cD(t){switch(t){case M.OK:return Q(64938);case M.CANCELLED:case M.UNKNOWN:case M.DEADLINE_EXCEEDED:case M.RESOURCE_EXHAUSTED:case M.INTERNAL:case M.UNAVAILABLE:case M.UNAUTHENTICATED:return!1;case M.INVALID_ARGUMENT:case M.NOT_FOUND:case M.ALREADY_EXISTS:case M.PERMISSION_DENIED:case M.FAILED_PRECONDITION:case M.ABORTED:case M.OUT_OF_RANGE:case M.UNIMPLEMENTED:case M.DATA_LOSS:return!0;default:return Q(15467,{code:t})}}function pS(t){if(t===void 0)return Yn("GRPC error has no .code"),M.UNKNOWN;switch(t){case Me.OK:return M.OK;case Me.CANCELLED:return M.CANCELLED;case Me.UNKNOWN:return M.UNKNOWN;case Me.DEADLINE_EXCEEDED:return M.DEADLINE_EXCEEDED;case Me.RESOURCE_EXHAUSTED:return M.RESOURCE_EXHAUSTED;case Me.INTERNAL:return M.INTERNAL;case Me.UNAVAILABLE:return M.UNAVAILABLE;case Me.UNAUTHENTICATED:return M.UNAUTHENTICATED;case Me.INVALID_ARGUMENT:return M.INVALID_ARGUMENT;case Me.NOT_FOUND:return M.NOT_FOUND;case Me.ALREADY_EXISTS:return M.ALREADY_EXISTS;case Me.PERMISSION_DENIED:return M.PERMISSION_DENIED;case Me.FAILED_PRECONDITION:return M.FAILED_PRECONDITION;case Me.ABORTED:return M.ABORTED;case Me.OUT_OF_RANGE:return M.OUT_OF_RANGE;case Me.UNIMPLEMENTED:return M.UNIMPLEMENTED;case Me.DATA_LOSS:return M.DATA_LOSS;default:return Q(39323,{code:t})}}(oe=Me||(Me={}))[oe.OK=0]="OK",oe[oe.CANCELLED=1]="CANCELLED",oe[oe.UNKNOWN=2]="UNKNOWN",oe[oe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",oe[oe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",oe[oe.NOT_FOUND=5]="NOT_FOUND",oe[oe.ALREADY_EXISTS=6]="ALREADY_EXISTS",oe[oe.PERMISSION_DENIED=7]="PERMISSION_DENIED",oe[oe.UNAUTHENTICATED=16]="UNAUTHENTICATED",oe[oe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",oe[oe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",oe[oe.ABORTED=10]="ABORTED",oe[oe.OUT_OF_RANGE=11]="OUT_OF_RANGE",oe[oe.UNIMPLEMENTED=12]="UNIMPLEMENTED",oe[oe.INTERNAL=13]="INTERNAL",oe[oe.UNAVAILABLE=14]="UNAVAILABLE",oe[oe.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hD=new Mr([4294967295,4294967295],0);function Y_(t){const e=M0().encode(t),n=new P0;return n.update(e),new Uint8Array(n.digest())}function J_(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Mr([n,r],0),new Mr([i,s],0)]}class Km{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new Go(`Invalid padding: ${n}`);if(r<0)throw new Go(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Go(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new Go(`Invalid padding when bitmap length is 0: ${n}`);this.fe=8*e.length-n,this.ge=Mr.fromNumber(this.fe)}pe(e,n,r){let i=e.add(n.multiply(Mr.fromNumber(r)));return i.compare(hD)===1&&(i=new Mr([i.getBits(0),i.getBits(1)],0)),i.modulo(this.ge).toNumber()}ye(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.fe===0)return!1;const n=Y_(e),[r,i]=J_(n);for(let s=0;s<this.hashCount;s++){const o=this.pe(r,i,s);if(!this.ye(o))return!1}return!0}static create(e,n,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new Km(s,i,n);return r.forEach(l=>o.insert(l)),o}insert(e){if(this.fe===0)return;const n=Y_(e),[r,i]=J_(n);for(let s=0;s<this.hashCount;s++){const o=this.pe(r,i,s);this.we(o)}}we(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class Go extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mh{constructor(e,n,r,i,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const i=new Map;return i.set(e,ul.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new mh(Z.min(),i,new ke(te),Jn(),se())}}class ul{constructor(e,n,r,i,s){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new ul(r,n,se(),se(),se())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ku{constructor(e,n,r,i){this.Se=e,this.removedTargetIds=n,this.key=r,this.be=i}}class mS{constructor(e,n){this.targetId=e,this.De=n}}class gS{constructor(e,n,r=Je.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=i}}class X_{constructor(){this.ve=0,this.Ce=Z_(),this.Fe=Je.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return this.ve!==0}get Ne(){return this.xe}Be(e){e.approximateByteSize()>0&&(this.xe=!0,this.Fe=e)}Le(){let e=se(),n=se(),r=se();return this.Ce.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:n=n.add(i);break;case 1:r=r.add(i);break;default:Q(38017,{changeType:s})}}),new ul(this.Fe,this.Me,e,n,r)}ke(){this.xe=!1,this.Ce=Z_()}qe(e,n){this.xe=!0,this.Ce=this.Ce.insert(e,n)}Qe(e){this.xe=!0,this.Ce=this.Ce.remove(e)}$e(){this.ve+=1}Ue(){this.ve-=1,ue(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class dD{constructor(e){this.We=e,this.Ge=new Map,this.ze=Jn(),this.je=ou(),this.Je=ou(),this.He=new ke(te)}Ye(e){for(const n of e.Se)e.be&&e.be.isFoundDocument()?this.Ze(n,e.be):this.Xe(n,e.key,e.be);for(const n of e.removedTargetIds)this.Xe(n,e.key,e.be)}et(e){this.forEachTarget(e,n=>{const r=this.tt(n);switch(e.state){case 0:this.nt(n)&&r.Be(e.resumeToken);break;case 1:r.Ue(),r.Oe||r.ke(),r.Be(e.resumeToken);break;case 2:r.Ue(),r.Oe||this.removeTarget(n);break;case 3:this.nt(n)&&(r.Ke(),r.Be(e.resumeToken));break;case 4:this.nt(n)&&(this.rt(n),r.Be(e.resumeToken));break;default:Q(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Ge.forEach((r,i)=>{this.nt(i)&&n(i)})}it(e){const n=e.targetId,r=e.De.count,i=this.st(n);if(i){const s=i.target;if(fp(s))if(r===0){const o=new G(s.path);this.Xe(n,o,ot.newNoDocument(o,Z.min()))}else ue(r===1,20013,{expectedCount:r});else{const o=this.ot(n);if(o!==r){const l=this._t(e),u=l?this.ut(l,e,o):1;if(u!==0){this.rt(n);const c=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(n,c)}}}}}_t(e){const n=e.De.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=n;let o,l;try{o=Wr(r).toUint8Array()}catch(u){if(u instanceof $0)return Br("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{l=new Km(o,i,s)}catch(u){return Br(u instanceof Go?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return l.fe===0?null:l}ut(e,n,r){return n.De.count===r-this.ht(e,n.targetId)?0:2}ht(e,n){const r=this.We.getRemoteKeysForTarget(n);let i=0;return r.forEach(s=>{const o=this.We.lt(),l=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(l)||(this.Xe(n,s,null),i++)}),i}Pt(e){const n=new Map;this.Ge.forEach((s,o)=>{const l=this.st(o);if(l){if(s.current&&fp(l.target)){const u=new G(l.target.path);this.Tt(u).has(o)||this.It(o,u)||this.Xe(o,u,ot.newNoDocument(u,e))}s.Ne&&(n.set(o,s.Le()),s.ke())}});let r=se();this.Je.forEach((s,o)=>{let l=!0;o.forEachWhile(u=>{const c=this.st(u);return!c||c.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(s))}),this.ze.forEach((s,o)=>o.setReadTime(e));const i=new mh(e,n,this.He,this.ze,r);return this.ze=Jn(),this.je=ou(),this.Je=ou(),this.He=new ke(te),i}Ze(e,n){if(!this.nt(e))return;const r=this.It(e,n.key)?2:0;this.tt(e).qe(n.key,r),this.ze=this.ze.insert(n.key,n),this.je=this.je.insert(n.key,this.Tt(n.key).add(e)),this.Je=this.Je.insert(n.key,this.dt(n.key).add(e))}Xe(e,n,r){if(!this.nt(e))return;const i=this.tt(e);this.It(e,n)?i.qe(n,1):i.Qe(n),this.Je=this.Je.insert(n,this.dt(n).delete(e)),this.Je=this.Je.insert(n,this.dt(n).add(e)),r&&(this.ze=this.ze.insert(n,r))}removeTarget(e){this.Ge.delete(e)}ot(e){const n=this.tt(e).Le();return this.We.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.tt(e).$e()}tt(e){let n=this.Ge.get(e);return n||(n=new X_,this.Ge.set(e,n)),n}dt(e){let n=this.Je.get(e);return n||(n=new je(te),this.Je=this.Je.insert(e,n)),n}Tt(e){let n=this.je.get(e);return n||(n=new je(te),this.je=this.je.insert(e,n)),n}nt(e){const n=this.st(e)!==null;return n||H("WatchChangeAggregator","Detected inactive target",e),n}st(e){const n=this.Ge.get(e);return n&&n.Oe?null:this.We.Et(e)}rt(e){this.Ge.set(e,new X_),this.We.getRemoteKeysForTarget(e).forEach(n=>{this.Xe(e,n,null)})}It(e,n){return this.We.getRemoteKeysForTarget(e).has(n)}}function ou(){return new ke(G.comparator)}function Z_(){return new ke(G.comparator)}const fD={asc:"ASCENDING",desc:"DESCENDING"},pD={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},mD={and:"AND",or:"OR"};class gD{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function mp(t,e){return t.useProto3Json||uh(e)?e:{value:e}}function vc(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function yS(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function yD(t,e){return vc(t,e.toTimestamp())}function wn(t){return ue(!!t,49232),Z.fromTimestamp(function(n){const r=Hr(n);return new _e(r.seconds,r.nanos)}(t))}function Qm(t,e){return gp(t,e).canonicalString()}function gp(t,e){const n=function(i){return new pe(["projects",i.projectId,"databases",i.database])}(t).child("documents");return e===void 0?n:n.child(e)}function vS(t){const e=pe.fromString(t);return ue(TS(e),10190,{key:e.toString()}),e}function yp(t,e){return Qm(t.databaseId,e.path)}function Ud(t,e){const n=vS(e);if(n.get(1)!==t.databaseId.projectId)throw new z(M.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new z(M.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new G(wS(n))}function _S(t,e){return Qm(t.databaseId,e)}function vD(t){const e=vS(t);return e.length===4?pe.emptyPath():wS(e)}function vp(t){return new pe(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function wS(t){return ue(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function ew(t,e,n){return{name:yp(t,e),fields:n.value.mapValue.fields}}function _D(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:Q(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(c,d){return c.useProto3Json?(ue(d===void 0||typeof d=="string",58123),Je.fromBase64String(d||"")):(ue(d===void 0||d instanceof Buffer||d instanceof Uint8Array,16193),Je.fromUint8Array(d||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,l=o&&function(c){const d=c.code===void 0?M.UNKNOWN:pS(c.code);return new z(d,c.message||"")}(o);n=new gS(r,i,s,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=Ud(t,r.document.name),s=wn(r.document.updateTime),o=r.document.createTime?wn(r.document.createTime):Z.min(),l=new wt({mapValue:{fields:r.document.fields}}),u=ot.newFoundDocument(i,s,o,l),c=r.targetIds||[],d=r.removedTargetIds||[];n=new ku(c,d,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=Ud(t,r.document),s=r.readTime?wn(r.readTime):Z.min(),o=ot.newNoDocument(i,s),l=r.removedTargetIds||[];n=new ku([],l,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=Ud(t,r.document),s=r.removedTargetIds||[];n=new ku([],s,i,null)}else{if(!("filter"in e))return Q(11601,{At:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new uD(i,s),l=r.targetId;n=new mS(l,o)}}return n}function wD(t,e){let n;if(e instanceof ll)n={update:ew(t,e.key,e.value)};else if(e instanceof fS)n={delete:yp(t,e.key)};else if(e instanceof ei)n={update:ew(t,e.key,e.data),updateMask:RD(e.fieldMask)};else{if(!(e instanceof oD))return Q(16599,{Rt:e.type});n={verify:yp(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(s,o){const l=o.transform;if(l instanceof ja)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof Ba)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof za)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof yc)return{fieldPath:o.field.canonicalString(),increment:l.Ee};throw Q(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(n.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:yD(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:Q(27497)}(t,e.precondition)),n}function ED(t,e){return t&&t.length>0?(ue(e!==void 0,14353),t.map(n=>function(i,s){let o=i.updateTime?wn(i.updateTime):wn(s);return o.isEqual(Z.min())&&(o=wn(s)),new rD(o,i.transformResults||[])}(n,e))):[]}function ID(t,e){return{documents:[_S(t,e.path)]}}function TD(t,e){const n={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=_S(t,i);const s=function(c){if(c.length!==0)return IS(un.create(c,"and"))}(e.filters);s&&(n.structuredQuery.where=s);const o=function(c){if(c.length!==0)return c.map(d=>function(m){return{field:ns(m.field),direction:CD(m.dir)}}(d))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const l=mp(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{Vt:n,parent:i}}function SD(t){let e=vD(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let i=null;if(r>0){ue(r===1,65062);const d=n.from[0];d.allDescendants?i=d.collectionId:e=e.child(d.collectionId)}let s=[];n.where&&(s=function(p){const m=ES(p);return m instanceof un&&Y0(m)?m.getFilters():[m]}(n.where));let o=[];n.orderBy&&(o=function(p){return p.map(m=>function(C){return new $a(rs(C.field),function(N){switch(N){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(m))}(n.orderBy));let l=null;n.limit&&(l=function(p){let m;return m=typeof p=="object"?p.value:p,uh(m)?null:m}(n.limit));let u=null;n.startAt&&(u=function(p){const m=!!p.before,w=p.values||[];return new mc(w,m)}(n.startAt));let c=null;return n.endAt&&(c=function(p){const m=!p.before,w=p.values||[];return new mc(w,m)}(n.endAt)),zO(e,i,o,s,l,"F",u,c)}function AD(t,e){const n=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Q(28987,{purpose:i})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function ES(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=rs(n.unaryFilter.field);return Ve.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=rs(n.unaryFilter.field);return Ve.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=rs(n.unaryFilter.field);return Ve.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=rs(n.unaryFilter.field);return Ve.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Q(61313);default:return Q(60726)}}(t):t.fieldFilter!==void 0?function(n){return Ve.create(rs(n.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Q(58110);default:return Q(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return un.create(n.compositeFilter.filters.map(r=>ES(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return Q(1026)}}(n.compositeFilter.op))}(t):Q(30097,{filter:t})}function CD(t){return fD[t]}function PD(t){return pD[t]}function kD(t){return mD[t]}function ns(t){return{fieldPath:t.canonicalString()}}function rs(t){return Ke.fromServerFormat(t.fieldPath)}function IS(t){return t instanceof Ve?function(n){if(n.op==="=="){if(j_(n.value))return{unaryFilter:{field:ns(n.field),op:"IS_NAN"}};if($_(n.value))return{unaryFilter:{field:ns(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(j_(n.value))return{unaryFilter:{field:ns(n.field),op:"IS_NOT_NAN"}};if($_(n.value))return{unaryFilter:{field:ns(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:ns(n.field),op:PD(n.op),value:n.value}}}(t):t instanceof un?function(n){const r=n.getFilters().map(i=>IS(i));return r.length===1?r[0]:{compositeFilter:{op:kD(n.op),filters:r}}}(t):Q(54877,{filter:t})}function RD(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function TS(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tr{constructor(e,n,r,i,s=Z.min(),o=Z.min(),l=Je.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=l,this.expectedCount=u}withSequenceNumber(e){return new Tr(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new Tr(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Tr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Tr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bD{constructor(e){this.gt=e}}function ND(t){const e=SD({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?gc(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OD{constructor(){this.Dn=new DD}addToCollectionParentIndex(e,n){return this.Dn.add(n),V.resolve()}getCollectionParents(e,n){return V.resolve(this.Dn.getEntries(n))}addFieldIndex(e,n){return V.resolve()}deleteFieldIndex(e,n){return V.resolve()}deleteAllFieldIndexes(e){return V.resolve()}createTargetIndexes(e,n){return V.resolve()}getDocumentsMatchingTarget(e,n){return V.resolve(null)}getIndexType(e,n){return V.resolve(0)}getFieldIndexes(e,n){return V.resolve([])}getNextCollectionGroupToUpdate(e){return V.resolve(null)}getMinOffset(e,n){return V.resolve(zr.min())}getMinOffsetFromCollectionGroup(e,n){return V.resolve(zr.min())}updateCollectionGroup(e,n,r){return V.resolve()}updateIndexEntries(e,n){return V.resolve()}}class DD{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n]||new je(pe.comparator),s=!i.has(r);return this.index[n]=i.add(r),s}has(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n];return i&&i.has(r)}getEntries(e){return(this.index[e]||new je(pe.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tw={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},SS=41943040;class vt{static withCacheSize(e){return new vt(e,vt.DEFAULT_COLLECTION_PERCENTILE,vt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */vt.DEFAULT_COLLECTION_PERCENTILE=10,vt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,vt.DEFAULT=new vt(SS,vt.DEFAULT_COLLECTION_PERCENTILE,vt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),vt.DISABLED=new vt(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ws{constructor(e){this._r=e}next(){return this._r+=2,this._r}static ar(){return new Ws(0)}static ur(){return new Ws(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nw="LruGarbageCollector",xD=1048576;function rw([t,e],[n,r]){const i=te(t,n);return i===0?te(e,r):i}class MD{constructor(e){this.Tr=e,this.buffer=new je(rw),this.Ir=0}dr(){return++this.Ir}Er(e){const n=[e,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(n);else{const r=this.buffer.last();rw(n,r)<0&&(this.buffer=this.buffer.delete(r).add(n))}}get maxValue(){return this.buffer.last()[0]}}class LD{constructor(e,n,r){this.garbageCollector=e,this.asyncQueue=n,this.localStore=r,this.Ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return this.Ar!==null}Rr(e){H(nw,`Garbage collection scheduled in ${e}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){so(n)?H(nw,"Ignoring IndexedDB error during garbage collection: ",n):await io(n)}await this.Rr(3e5)})}}class VD{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.mr(e).next(r=>Math.floor(n/100*r))}nthSequenceNumber(e,n){if(n===0)return V.resolve(lh.ue);const r=new MD(n);return this.Vr.forEachTarget(e,i=>r.Er(i.sequenceNumber)).next(()=>this.Vr.gr(e,i=>r.Er(i))).next(()=>r.maxValue)}removeTargets(e,n,r){return this.Vr.removeTargets(e,n,r)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?(H("LruGarbageCollector","Garbage collection skipped; disabled"),V.resolve(tw)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(H("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),tw):this.pr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}pr(e,n){let r,i,s,o,l,u,c;const d=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(H("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),i=this.params.maximumSequenceNumbersToCollect):i=p,o=Date.now(),this.nthSequenceNumber(e,i))).next(p=>(r=p,l=Date.now(),this.removeTargets(e,r,n))).next(p=>(s=p,u=Date.now(),this.removeOrphanedDocuments(e,r))).next(p=>(c=Date.now(),es()<=ie.DEBUG&&H("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-d}ms
	Determined least recently used ${i} in `+(l-o)+`ms
	Removed ${s} targets in `+(u-l)+`ms
	Removed ${p} documents in `+(c-u)+`ms
Total Duration: ${c-d}ms`),V.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:p})))}}function FD(t,e){return new VD(t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UD{constructor(){this.changes=new zi(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,ot.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?V.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $D{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jD{constructor(e,n,r,i){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,n))).next(i=>(r!==null&&ha(r.mutation,i,Ot.empty(),_e.now()),i))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,se()).next(()=>r))}getLocalViewOfDocuments(e,n,r=se()){const i=gi();return this.populateOverlays(e,i,n).next(()=>this.computeViews(e,n,i,r).next(s=>{let o=qo();return s.forEach((l,u)=>{o=o.insert(l,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const r=gi();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,se()))}populateOverlays(e,n,r){const i=[];return r.forEach(s=>{n.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,l)=>{n.set(o,l)})})}computeViews(e,n,r,i){let s=Jn();const o=ca(),l=function(){return ca()}();return n.forEach((u,c)=>{const d=r.get(c.key);i.has(c.key)&&(d===void 0||d.mutation instanceof ei)?s=s.insert(c.key,c):d!==void 0?(o.set(c.key,d.mutation.getFieldMask()),ha(d.mutation,c,d.mutation.getFieldMask(),_e.now())):o.set(c.key,Ot.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((c,d)=>o.set(c,d)),n.forEach((c,d)=>{var p;return l.set(c,new $D(d,(p=o.get(c))!==null&&p!==void 0?p:null))}),l))}recalculateAndSaveOverlays(e,n){const r=ca();let i=new ke((o,l)=>o-l),s=se();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const l of o)l.keys().forEach(u=>{const c=n.get(u);if(c===null)return;let d=r.get(u)||Ot.empty();d=l.applyToLocalView(c,d),r.set(u,d);const p=(i.get(l.batchId)||se()).add(u);i=i.insert(l.batchId,p)})}).next(()=>{const o=[],l=i.getReverseIterator();for(;l.hasNext();){const u=l.getNext(),c=u.key,d=u.value,p=sS();d.forEach(m=>{if(!s.has(m)){const w=hS(n.get(m),r.get(m));w!==null&&p.set(m,w),s=s.add(m)}}),o.push(this.documentOverlayCache.saveOverlays(e,c,p))}return V.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,i){return function(o){return G.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):eS(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,i):this.getDocumentsMatchingCollectionQuery(e,n,r,i)}getNextDocuments(e,n,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,i).next(s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,i-s.size):V.resolve(gi());let l=La,u=s;return o.next(c=>V.forEach(c,(d,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),s.get(d)?V.resolve():this.remoteDocumentCache.getEntry(e,d).next(m=>{u=u.insert(d,m)}))).next(()=>this.populateOverlays(e,c,s)).next(()=>this.computeViews(e,u,c,se())).next(d=>({batchId:l,changes:iS(d)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new G(n)).next(r=>{let i=qo();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,n,r,i){const s=n.collectionGroup;let o=qo();return this.indexManager.getCollectionParents(e,s).next(l=>V.forEach(l,u=>{const c=function(p,m){return new oo(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,c,r,i).next(d=>{d.forEach((p,m)=>{o=o.insert(p,m)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,n,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,s,i))).next(o=>{s.forEach((u,c)=>{const d=c.getKey();o.get(d)===null&&(o=o.insert(d,ot.newInvalidDocument(d)))});let l=qo();return o.forEach((u,c)=>{const d=s.get(u);d!==void 0&&ha(d.mutation,c,Ot.empty(),_e.now()),dh(n,c)&&(l=l.insert(u,c))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BD{constructor(e){this.serializer=e,this.Br=new Map,this.Lr=new Map}getBundleMetadata(e,n){return V.resolve(this.Br.get(n))}saveBundleMetadata(e,n){return this.Br.set(n.id,function(i){return{id:i.id,version:i.version,createTime:wn(i.createTime)}}(n)),V.resolve()}getNamedQuery(e,n){return V.resolve(this.Lr.get(n))}saveNamedQuery(e,n){return this.Lr.set(n.name,function(i){return{name:i.name,query:ND(i.bundledQuery),readTime:wn(i.readTime)}}(n)),V.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zD{constructor(){this.overlays=new ke(G.comparator),this.kr=new Map}getOverlay(e,n){return V.resolve(this.overlays.get(n))}getOverlays(e,n){const r=gi();return V.forEach(n,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((i,s)=>{this.wt(e,n,s)}),V.resolve()}removeOverlaysForBatchId(e,n,r){const i=this.kr.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.kr.delete(r)),V.resolve()}getOverlaysForCollection(e,n,r){const i=gi(),s=n.length+1,o=new G(n.child("")),l=this.overlays.getIteratorFrom(o);for(;l.hasNext();){const u=l.getNext().value,c=u.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===s&&u.largestBatchId>r&&i.set(u.getKey(),u)}return V.resolve(i)}getOverlaysForCollectionGroup(e,n,r,i){let s=new ke((c,d)=>c-d);const o=this.overlays.getIterator();for(;o.hasNext();){const c=o.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>r){let d=s.get(c.largestBatchId);d===null&&(d=gi(),s=s.insert(c.largestBatchId,d)),d.set(c.getKey(),c)}}const l=gi(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((c,d)=>l.set(c,d)),!(l.size()>=i)););return V.resolve(l)}wt(e,n,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.kr.get(i.largestBatchId).delete(r.key);this.kr.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new lD(n,r));let s=this.kr.get(n);s===void 0&&(s=se(),this.kr.set(n,s)),this.kr.set(n,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HD{constructor(){this.sessionToken=Je.EMPTY_BYTE_STRING}getSessionToken(e){return V.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,V.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ym{constructor(){this.qr=new je(Be.Qr),this.$r=new je(Be.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(e,n){const r=new Be(e,n);this.qr=this.qr.add(r),this.$r=this.$r.add(r)}Kr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Wr(new Be(e,n))}Gr(e,n){e.forEach(r=>this.removeReference(r,n))}zr(e){const n=new G(new pe([])),r=new Be(n,e),i=new Be(n,e+1),s=[];return this.$r.forEachInRange([r,i],o=>{this.Wr(o),s.push(o.key)}),s}jr(){this.qr.forEach(e=>this.Wr(e))}Wr(e){this.qr=this.qr.delete(e),this.$r=this.$r.delete(e)}Jr(e){const n=new G(new pe([])),r=new Be(n,e),i=new Be(n,e+1);let s=se();return this.$r.forEachInRange([r,i],o=>{s=s.add(o.key)}),s}containsKey(e){const n=new Be(e,0),r=this.qr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class Be{constructor(e,n){this.key=e,this.Hr=n}static Qr(e,n){return G.comparator(e.key,n.key)||te(e.Hr,n.Hr)}static Ur(e,n){return te(e.Hr,n.Hr)||G.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WD{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.er=1,this.Yr=new je(Be.Qr)}checkEmpty(e){return V.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,i){const s=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new aD(s,n,r,i);this.mutationQueue.push(o);for(const l of i)this.Yr=this.Yr.add(new Be(l.key,s)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return V.resolve(o)}lookupMutationBatch(e,n){return V.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,i=this.Xr(r),s=i<0?0:i;return V.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return V.resolve(this.mutationQueue.length===0?$m:this.er-1)}getAllMutationBatches(e){return V.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new Be(n,0),i=new Be(n,Number.POSITIVE_INFINITY),s=[];return this.Yr.forEachInRange([r,i],o=>{const l=this.Zr(o.Hr);s.push(l)}),V.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new je(te);return n.forEach(i=>{const s=new Be(i,0),o=new Be(i,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([s,o],l=>{r=r.add(l.Hr)})}),V.resolve(this.ei(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,i=r.length+1;let s=r;G.isDocumentKey(s)||(s=s.child(""));const o=new Be(new G(s),0);let l=new je(te);return this.Yr.forEachWhile(u=>{const c=u.key.path;return!!r.isPrefixOf(c)&&(c.length===i&&(l=l.add(u.Hr)),!0)},o),V.resolve(this.ei(l))}ei(e){const n=[];return e.forEach(r=>{const i=this.Zr(r);i!==null&&n.push(i)}),n}removeMutationBatch(e,n){ue(this.ti(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Yr;return V.forEach(n.mutations,i=>{const s=new Be(i.key,n.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Yr=r})}rr(e){}containsKey(e,n){const r=new Be(n,0),i=this.Yr.firstAfterOrEqual(r);return V.resolve(n.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,V.resolve()}ti(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qD{constructor(e){this.ni=e,this.docs=function(){return new ke(G.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,i=this.docs.get(r),s=i?i.size:0,o=this.ni(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return V.resolve(r?r.document.mutableCopy():ot.newInvalidDocument(n))}getEntries(e,n){let r=Jn();return n.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():ot.newInvalidDocument(i))}),V.resolve(r)}getDocumentsMatchingQuery(e,n,r,i){let s=Jn();const o=n.path,l=new G(o.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(l);for(;u.hasNext();){const{key:c,value:{document:d}}=u.getNext();if(!o.isPrefixOf(c.path))break;c.path.length>o.length+1||EO(wO(d),r)<=0||(i.has(d.key)||dh(n,d))&&(s=s.insert(d.key,d.mutableCopy()))}return V.resolve(s)}getAllFromCollectionGroup(e,n,r,i){Q(9500)}ri(e,n){return V.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new GD(this)}getSize(e){return V.resolve(this.size)}}class GD extends UD{constructor(e){super(),this.Or=e}applyChanges(e){const n=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?n.push(this.Or.addEntry(e,i)):this.Or.removeEntry(r)}),V.waitFor(n)}getFromCache(e,n){return this.Or.getEntry(e,n)}getAllFromCache(e,n){return this.Or.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KD{constructor(e){this.persistence=e,this.ii=new zi(n=>zm(n),Hm),this.lastRemoteSnapshotVersion=Z.min(),this.highestTargetId=0,this.si=0,this.oi=new Ym,this.targetCount=0,this._i=Ws.ar()}forEachTarget(e,n){return this.ii.forEach((r,i)=>n(i)),V.resolve()}getLastRemoteSnapshotVersion(e){return V.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return V.resolve(this.si)}allocateTargetId(e){return this.highestTargetId=this._i.next(),V.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.si&&(this.si=n),V.resolve()}hr(e){this.ii.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this._i=new Ws(n),this.highestTargetId=n),e.sequenceNumber>this.si&&(this.si=e.sequenceNumber)}addTargetData(e,n){return this.hr(n),this.targetCount+=1,V.resolve()}updateTargetData(e,n){return this.hr(n),V.resolve()}removeTargetData(e,n){return this.ii.delete(n.target),this.oi.zr(n.targetId),this.targetCount-=1,V.resolve()}removeTargets(e,n,r){let i=0;const s=[];return this.ii.forEach((o,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.ii.delete(o),s.push(this.removeMatchingKeysForTargetId(e,l.targetId)),i++)}),V.waitFor(s).next(()=>i)}getTargetCount(e){return V.resolve(this.targetCount)}getTargetData(e,n){const r=this.ii.get(n)||null;return V.resolve(r)}addMatchingKeys(e,n,r){return this.oi.Kr(n,r),V.resolve()}removeMatchingKeys(e,n,r){this.oi.Gr(n,r);const i=this.persistence.referenceDelegate,s=[];return i&&n.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),V.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.oi.zr(n),V.resolve()}getMatchingKeysForTargetId(e,n){const r=this.oi.Jr(n);return V.resolve(r)}containsKey(e,n){return V.resolve(this.oi.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AS{constructor(e,n){this.ai={},this.overlays={},this.ui=new lh(0),this.ci=!1,this.ci=!0,this.li=new HD,this.referenceDelegate=e(this),this.hi=new KD(this),this.indexManager=new OD,this.remoteDocumentCache=function(i){return new qD(i)}(r=>this.referenceDelegate.Pi(r)),this.serializer=new bD(n),this.Ti=new BD(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new zD,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.ai[e.toKey()];return r||(r=new WD(n,this.referenceDelegate),this.ai[e.toKey()]=r),r}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(e,n,r){H("MemoryPersistence","Starting transaction:",e);const i=new QD(this.ui.next());return this.referenceDelegate.Ii(),r(i).next(s=>this.referenceDelegate.di(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Ei(e,n){return V.or(Object.values(this.ai).map(r=>()=>r.containsKey(e,n)))}}class QD extends TO{constructor(e){super(),this.currentSequenceNumber=e}}class Jm{constructor(e){this.persistence=e,this.Ai=new Ym,this.Ri=null}static Vi(e){return new Jm(e)}get mi(){if(this.Ri)return this.Ri;throw Q(60996)}addReference(e,n,r){return this.Ai.addReference(r,n),this.mi.delete(r.toString()),V.resolve()}removeReference(e,n,r){return this.Ai.removeReference(r,n),this.mi.add(r.toString()),V.resolve()}markPotentiallyOrphaned(e,n){return this.mi.add(n.toString()),V.resolve()}removeTarget(e,n){this.Ai.zr(n.targetId).forEach(i=>this.mi.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(i=>{i.forEach(s=>this.mi.add(s.toString()))}).next(()=>r.removeTargetData(e,n))}Ii(){this.Ri=new Set}di(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return V.forEach(this.mi,r=>{const i=G.fromPath(r);return this.fi(e,i).next(s=>{s||n.removeEntry(i,Z.min())})}).next(()=>(this.Ri=null,n.apply(e)))}updateLimboDocument(e,n){return this.fi(e,n).next(r=>{r?this.mi.delete(n.toString()):this.mi.add(n.toString())})}Pi(e){return 0}fi(e,n){return V.or([()=>V.resolve(this.Ai.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}}class _c{constructor(e,n){this.persistence=e,this.gi=new zi(r=>CO(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=FD(this,n)}static Vi(e,n){return new _c(e,n)}Ii(){}di(e){return V.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}mr(e){const n=this.yr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>n.next(i=>r+i))}yr(e){let n=0;return this.gr(e,r=>{n++}).next(()=>n)}gr(e,n){return V.forEach(this.gi,(r,i)=>this.Sr(e,r,i).next(s=>s?V.resolve():n(i)))}removeTargets(e,n,r){return this.persistence.getTargetCache().removeTargets(e,n,r)}removeOrphanedDocuments(e,n){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.ri(e,o=>this.Sr(e,o,n).next(l=>{l||(r++,s.removeEntry(o,Z.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,n){return this.gi.set(n,e.currentSequenceNumber),V.resolve()}removeTarget(e,n){const r=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,n,r){return this.gi.set(r,e.currentSequenceNumber),V.resolve()}removeReference(e,n,r){return this.gi.set(r,e.currentSequenceNumber),V.resolve()}updateLimboDocument(e,n){return this.gi.set(n,e.currentSequenceNumber),V.resolve()}Pi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=Au(e.data.value)),n}Sr(e,n,r){return V.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{const i=this.gi.get(n);return V.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xm{constructor(e,n,r,i){this.targetId=e,this.fromCache=n,this.Is=r,this.ds=i}static Es(e,n){let r=se(),i=se();for(const s of n.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new Xm(e,n.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class YD{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JD{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=function(){return zb()?8:SO(ut())>0?6:4}()}initialize(e,n){this.gs=e,this.indexManager=n,this.As=!0}getDocumentsMatchingQuery(e,n,r,i){const s={result:null};return this.ps(e,n).next(o=>{s.result=o}).next(()=>{if(!s.result)return this.ys(e,n,i,r).next(o=>{s.result=o})}).next(()=>{if(s.result)return;const o=new YD;return this.ws(e,n,o).next(l=>{if(s.result=l,this.Rs)return this.Ss(e,n,o,l.size)})}).next(()=>s.result)}Ss(e,n,r,i){return r.documentReadCount<this.Vs?(es()<=ie.DEBUG&&H("QueryEngine","SDK will not create cache indexes for query:",ts(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),V.resolve()):(es()<=ie.DEBUG&&H("QueryEngine","Query:",ts(n),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.fs*i?(es()<=ie.DEBUG&&H("QueryEngine","The SDK decides to create cache indexes for query:",ts(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,_n(n))):V.resolve())}ps(e,n){if(W_(n))return V.resolve(null);let r=_n(n);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(n.limit!==null&&i===1&&(n=gc(n,null,"F"),r=_n(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const o=se(...s);return this.gs.getDocuments(e,o).next(l=>this.indexManager.getMinOffset(e,r).next(u=>{const c=this.bs(n,l);return this.Ds(n,c,o,u.readTime)?this.ps(e,gc(n,null,"F")):this.vs(e,c,n,u)}))})))}ys(e,n,r,i){return W_(n)||i.isEqual(Z.min())?V.resolve(null):this.gs.getDocuments(e,r).next(s=>{const o=this.bs(n,s);return this.Ds(n,o,r,i)?V.resolve(null):(es()<=ie.DEBUG&&H("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),ts(n)),this.vs(e,o,n,_O(i,La)).next(l=>l))})}bs(e,n){let r=new je(nS(e));return n.forEach((i,s)=>{dh(e,s)&&(r=r.add(s))}),r}Ds(e,n,r,i){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}ws(e,n,r){return es()<=ie.DEBUG&&H("QueryEngine","Using full collection scan to execute query:",ts(n)),this.gs.getDocumentsMatchingQuery(e,n,zr.min(),r)}vs(e,n,r,i){return this.gs.getDocumentsMatchingQuery(e,r,i).next(s=>(n.forEach(o=>{s=s.insert(o.key,o)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zm="LocalStore",XD=3e8;class ZD{constructor(e,n,r,i){this.persistence=e,this.Cs=n,this.serializer=i,this.Fs=new ke(te),this.Ms=new zi(s=>zm(s),Hm),this.xs=new Map,this.Os=e.getRemoteDocumentCache(),this.hi=e.getTargetCache(),this.Ti=e.getBundleCache(),this.Ns(r)}Ns(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new jD(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.Fs))}}function ex(t,e,n,r){return new ZD(t,e,n,r)}async function CS(t,e){const n=ee(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let i;return n.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,n.Ns(e),n.mutationQueue.getAllMutationBatches(r))).next(s=>{const o=[],l=[];let u=se();for(const c of i){o.push(c.batchId);for(const d of c.mutations)u=u.add(d.key)}for(const c of s){l.push(c.batchId);for(const d of c.mutations)u=u.add(d.key)}return n.localDocuments.getDocuments(r,u).next(c=>({Bs:c,removedBatchIds:o,addedBatchIds:l}))})})}function tx(t,e){const n=ee(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=n.Os.newChangeBuffer({trackRemovals:!0});return function(l,u,c,d){const p=c.batch,m=p.keys();let w=V.resolve();return m.forEach(C=>{w=w.next(()=>d.getEntry(u,C)).next(P=>{const N=c.docVersions.get(C);ue(N!==null,48541),P.version.compareTo(N)<0&&(p.applyToRemoteDocument(P,c),P.isValidDocument()&&(P.setReadTime(c.commitVersion),d.addEntry(P)))})}),w.next(()=>l.mutationQueue.removeMutationBatch(u,p))}(n,r,e,s).next(()=>s.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let u=se();for(let c=0;c<l.mutationResults.length;++c)l.mutationResults[c].transformResults.length>0&&(u=u.add(l.batch.mutations[c].key));return u}(e))).next(()=>n.localDocuments.getDocuments(r,i))})}function PS(t){const e=ee(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.hi.getLastRemoteSnapshotVersion(n))}function nx(t,e){const n=ee(t),r=e.snapshotVersion;let i=n.Fs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const o=n.Os.newChangeBuffer({trackRemovals:!0});i=n.Fs;const l=[];e.targetChanges.forEach((d,p)=>{const m=i.get(p);if(!m)return;l.push(n.hi.removeMatchingKeys(s,d.removedDocuments,p).next(()=>n.hi.addMatchingKeys(s,d.addedDocuments,p)));let w=m.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?w=w.withResumeToken(Je.EMPTY_BYTE_STRING,Z.min()).withLastLimboFreeSnapshotVersion(Z.min()):d.resumeToken.approximateByteSize()>0&&(w=w.withResumeToken(d.resumeToken,r)),i=i.insert(p,w),function(P,N,I){return P.resumeToken.approximateByteSize()===0||N.snapshotVersion.toMicroseconds()-P.snapshotVersion.toMicroseconds()>=XD?!0:I.addedDocuments.size+I.modifiedDocuments.size+I.removedDocuments.size>0}(m,w,d)&&l.push(n.hi.updateTargetData(s,w))});let u=Jn(),c=se();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(s,d))}),l.push(rx(s,o,e.documentUpdates).next(d=>{u=d.Ls,c=d.ks})),!r.isEqual(Z.min())){const d=n.hi.getLastRemoteSnapshotVersion(s).next(p=>n.hi.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(d)}return V.waitFor(l).next(()=>o.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,u,c)).next(()=>u)}).then(s=>(n.Fs=i,s))}function rx(t,e,n){let r=se(),i=se();return n.forEach(s=>r=r.add(s)),e.getEntries(t,r).next(s=>{let o=Jn();return n.forEach((l,u)=>{const c=s.get(l);u.isFoundDocument()!==c.isFoundDocument()&&(i=i.add(l)),u.isNoDocument()&&u.version.isEqual(Z.min())?(e.removeEntry(l,u.readTime),o=o.insert(l,u)):!c.isValidDocument()||u.version.compareTo(c.version)>0||u.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(u),o=o.insert(l,u)):H(Zm,"Ignoring outdated watch update for ",l,". Current version:",c.version," Watch version:",u.version)}),{Ls:o,ks:i}})}function ix(t,e){const n=ee(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=$m),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function sx(t,e){const n=ee(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return n.hi.getTargetData(r,e).next(s=>s?(i=s,V.resolve(i)):n.hi.allocateTargetId(r).next(o=>(i=new Tr(e,o,"TargetPurposeListen",r.currentSequenceNumber),n.hi.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=n.Fs.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(n.Fs=n.Fs.insert(r.targetId,r),n.Ms.set(e,r.targetId)),r})}async function _p(t,e,n){const r=ee(t),i=r.Fs.get(e),s=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",s,o=>r.persistence.referenceDelegate.removeTarget(o,i))}catch(o){if(!so(o))throw o;H(Zm,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Fs=r.Fs.remove(e),r.Ms.delete(i.target)}function iw(t,e,n){const r=ee(t);let i=Z.min(),s=se();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,c,d){const p=ee(u),m=p.Ms.get(d);return m!==void 0?V.resolve(p.Fs.get(m)):p.hi.getTargetData(c,d)}(r,o,_n(e)).next(l=>{if(l)return i=l.lastLimboFreeSnapshotVersion,r.hi.getMatchingKeysForTargetId(o,l.targetId).next(u=>{s=u})}).next(()=>r.Cs.getDocumentsMatchingQuery(o,e,n?i:Z.min(),n?s:se())).next(l=>(ox(r,WO(e),l),{documents:l,qs:s})))}function ox(t,e,n){let r=t.xs.get(e)||Z.min();n.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),t.xs.set(e,r)}class sw{constructor(){this.activeTargetIds=JO()}Gs(e){this.activeTargetIds=this.activeTargetIds.add(e)}zs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class ax{constructor(){this.Fo=new sw,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.Fo.Gs(e),this.Mo[e]||"not-current"}updateQueryState(e,n,r){this.Mo[e]=n}removeLocalQueryTarget(e){this.Fo.zs(e)}isLocalQueryTarget(e){return this.Fo.activeTargetIds.has(e)}clearQueryState(e){delete this.Mo[e]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(e){return this.Fo.activeTargetIds.has(e)}start(){return this.Fo=new sw,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lx{xo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ow="ConnectivityMonitor";class aw{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(e){this.ko.push(e)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){H(ow,"Network connectivity changed: AVAILABLE");for(const e of this.ko)e(0)}Lo(){H(ow,"Network connectivity changed: UNAVAILABLE");for(const e of this.ko)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let au=null;function wp(){return au===null?au=function(){return 268435456+Math.round(2147483648*Math.random())}():au++,"0x"+au.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $d="RestConnection",ux={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class cx{get Qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.$o=n+"://"+e.host,this.Uo=`projects/${r}/databases/${i}`,this.Ko=this.databaseId.database===fc?`project_id=${r}`:`project_id=${r}&database_id=${i}`}Wo(e,n,r,i,s){const o=wp(),l=this.Go(e,n.toUriEncodedString());H($d,`Sending RPC '${e}' ${o}:`,l,r);const u={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(u,i,s);const{host:c}=new URL(l),d=$i(c);return this.jo(e,l,u,r,d).then(p=>(H($d,`Received RPC '${e}' ${o}: `,p),p),p=>{throw Br($d,`RPC '${e}' ${o} failed with error: `,p,"url: ",l,"request:",r),p})}Jo(e,n,r,i,s,o){return this.Wo(e,n,r,i,s)}zo(e,n,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+ro}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i)}Go(e,n){const r=ux[e];return`${this.$o}/v1/${n}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hx{constructor(e){this.Ho=e.Ho,this.Yo=e.Yo}Zo(e){this.Xo=e}e_(e){this.t_=e}n_(e){this.r_=e}onMessage(e){this.i_=e}close(){this.Yo()}send(e){this.Ho(e)}s_(){this.Xo()}o_(){this.t_()}__(e){this.r_(e)}a_(e){this.i_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rt="WebChannelConnection";class dx extends cx{constructor(e){super(e),this.u_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}jo(e,n,r,i,s){const o=wp();return new Promise((l,u)=>{const c=new k0;c.setWithCredentials(!0),c.listenOnce(R0.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case Su.NO_ERROR:const p=c.getResponseJson();H(rt,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),l(p);break;case Su.TIMEOUT:H(rt,`RPC '${e}' ${o} timed out`),u(new z(M.DEADLINE_EXCEEDED,"Request time out"));break;case Su.HTTP_ERROR:const m=c.getStatus();if(H(rt,`RPC '${e}' ${o} failed with status:`,m,"response text:",c.getResponseText()),m>0){let w=c.getResponseJson();Array.isArray(w)&&(w=w[0]);const C=w==null?void 0:w.error;if(C&&C.status&&C.message){const P=function(I){const y=I.toLowerCase().replace(/_/g,"-");return Object.values(M).indexOf(y)>=0?y:M.UNKNOWN}(C.status);u(new z(P,C.message))}else u(new z(M.UNKNOWN,"Server responded with status "+c.getStatus()))}else u(new z(M.UNAVAILABLE,"Connection failed."));break;default:Q(9055,{c_:e,streamId:o,l_:c.getLastErrorCode(),h_:c.getLastError()})}}finally{H(rt,`RPC '${e}' ${o} completed.`)}});const d=JSON.stringify(i);H(rt,`RPC '${e}' ${o} sending request:`,i),c.send(n,"POST",d,r,15)})}P_(e,n,r){const i=wp(),s=[this.$o,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=O0(),l=N0(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;c!==void 0&&(u.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(u.useFetchStreams=!0),this.zo(u.initMessageHeaders,n,r),u.encodeInitMessageHeaders=!0;const d=s.join("");H(rt,`Creating RPC '${e}' stream ${i}: ${d}`,u);const p=o.createWebChannel(d,u);this.T_(p);let m=!1,w=!1;const C=new hx({Ho:N=>{w?H(rt,`Not sending because RPC '${e}' stream ${i} is closed:`,N):(m||(H(rt,`Opening RPC '${e}' stream ${i} transport.`),p.open(),m=!0),H(rt,`RPC '${e}' stream ${i} sending:`,N),p.send(N))},Yo:()=>p.close()}),P=(N,I,y)=>{N.listen(I,S=>{try{y(S)}catch(b){setTimeout(()=>{throw b},0)}})};return P(p,Wo.EventType.OPEN,()=>{w||(H(rt,`RPC '${e}' stream ${i} transport opened.`),C.s_())}),P(p,Wo.EventType.CLOSE,()=>{w||(w=!0,H(rt,`RPC '${e}' stream ${i} transport closed`),C.__(),this.I_(p))}),P(p,Wo.EventType.ERROR,N=>{w||(w=!0,Br(rt,`RPC '${e}' stream ${i} transport errored. Name:`,N.name,"Message:",N.message),C.__(new z(M.UNAVAILABLE,"The operation could not be completed")))}),P(p,Wo.EventType.MESSAGE,N=>{var I;if(!w){const y=N.data[0];ue(!!y,16349);const S=y,b=(S==null?void 0:S.error)||((I=S[0])===null||I===void 0?void 0:I.error);if(b){H(rt,`RPC '${e}' stream ${i} received error:`,b);const F=b.status;let $=function(E){const T=Me[E];if(T!==void 0)return pS(T)}(F),_=b.message;$===void 0&&($=M.INTERNAL,_="Unknown error status: "+F+" with message "+b.message),w=!0,C.__(new z($,_)),p.close()}else H(rt,`RPC '${e}' stream ${i} received:`,y),C.a_(y)}}),P(l,b0.STAT_EVENT,N=>{N.stat===lp.PROXY?H(rt,`RPC '${e}' stream ${i} detected buffering proxy`):N.stat===lp.NOPROXY&&H(rt,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{C.o_()},0),C}terminate(){this.u_.forEach(e=>e.close()),this.u_=[]}T_(e){this.u_.push(e)}I_(e){this.u_=this.u_.filter(n=>n===e)}}function jd(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gh(t){return new gD(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kS{constructor(e,n,r=1e3,i=1.5,s=6e4){this.Fi=e,this.timerId=n,this.d_=r,this.E_=i,this.A_=s,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const n=Math.floor(this.R_+this.p_()),r=Math.max(0,Date.now()-this.m_),i=Math.max(0,n-r);i>0&&H("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.R_} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,i,()=>(this.m_=Date.now(),e())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lw="PersistentStream";class RS{constructor(e,n,r,i,s,o,l,u){this.Fi=e,this.w_=r,this.S_=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=l,this.listener=u,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new kS(e,n)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.C_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,()=>this.L_()))}k_(e){this.q_(),this.stream.send(e)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,e!==4?this.F_.reset():n&&n.code===M.RESOURCE_EXHAUSTED?(Yn(n.toString()),Yn("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):n&&n.code===M.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.n_(n)}U_(){}auth(){this.state=1;const e=this.K_(this.b_),n=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.b_===n&&this.W_(r,i)},r=>{e(()=>{const i=new z(M.UNKNOWN,"Fetching auth token failed: "+r.message);return this.G_(i)})})}W_(e,n){const r=this.K_(this.b_);this.stream=this.z_(e,n),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.e_(()=>{r(()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,()=>(this.x_()&&(this.state=3),Promise.resolve())),this.listener.e_()))}),this.stream.n_(i=>{r(()=>this.G_(i))}),this.stream.onMessage(i=>{r(()=>++this.C_==1?this.j_(i):this.onNext(i))})}O_(){this.state=5,this.F_.g_(async()=>{this.state=0,this.start()})}G_(e){return H(lw,`close with error: ${e}`),this.stream=null,this.close(4,e)}K_(e){return n=>{this.Fi.enqueueAndForget(()=>this.b_===e?n():(H(lw,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class fx extends RS{constructor(e,n,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}z_(e,n){return this.connection.P_("Listen",e,n)}j_(e){return this.onNext(e)}onNext(e){this.F_.reset();const n=_D(this.serializer,e),r=function(s){if(!("targetChange"in s))return Z.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?Z.min():o.readTime?wn(o.readTime):Z.min()}(e);return this.listener.J_(n,r)}H_(e){const n={};n.database=vp(this.serializer),n.addTarget=function(s,o){let l;const u=o.target;if(l=fp(u)?{documents:ID(s,u)}:{query:TD(s,u).Vt},l.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){l.resumeToken=yS(s,o.resumeToken);const c=mp(s,o.expectedCount);c!==null&&(l.expectedCount=c)}else if(o.snapshotVersion.compareTo(Z.min())>0){l.readTime=vc(s,o.snapshotVersion.toTimestamp());const c=mp(s,o.expectedCount);c!==null&&(l.expectedCount=c)}return l}(this.serializer,e);const r=AD(this.serializer,e);r&&(n.labels=r),this.k_(n)}Y_(e){const n={};n.database=vp(this.serializer),n.removeTarget=e,this.k_(n)}}class px extends RS{constructor(e,n,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(e,n){return this.connection.P_("Write",e,n)}j_(e){return ue(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,ue(!e.writeResults||e.writeResults.length===0,55816),this.listener.ea()}onNext(e){ue(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.F_.reset();const n=ED(e.writeResults,e.commitTime),r=wn(e.commitTime);return this.listener.ta(r,n)}na(){const e={};e.database=vp(this.serializer),this.k_(e)}X_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>wD(this.serializer,r))};this.k_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mx{}class gx extends mx{constructor(e,n,r,i){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=i,this.ra=!1}ia(){if(this.ra)throw new z(M.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,r,i){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.Wo(e,gp(n,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new z(M.UNKNOWN,s.toString())})}Jo(e,n,r,i,s){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.Jo(e,gp(n,r),i,o,l,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new z(M.UNKNOWN,o.toString())})}terminate(){this.ra=!0,this.connection.terminate()}}class yx{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve())))}la(e){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ua("Offline")))}set(e){this.ha(),this.sa=0,e==="Online"&&(this._a=!1),this.ua(e)}ua(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ca(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(Yn(n),this._a=!1):H("OnlineStateTracker",n)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ni="RemoteStore";class vx{constructor(e,n,r,i,s){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=s,this.Ea.xo(o=>{r.enqueueAndForget(async()=>{Hi(this)&&(H(Ni,"Restarting streams for network reachability change."),await async function(u){const c=ee(u);c.Ia.add(4),await cl(c),c.Aa.set("Unknown"),c.Ia.delete(4),await yh(c)}(this))})}),this.Aa=new yx(r,i)}}async function yh(t){if(Hi(t))for(const e of t.da)await e(!0)}async function cl(t){for(const e of t.da)await e(!1)}function bS(t,e){const n=ee(t);n.Ta.has(e.targetId)||(n.Ta.set(e.targetId,e),rg(n)?ng(n):ao(n).x_()&&tg(n,e))}function eg(t,e){const n=ee(t),r=ao(n);n.Ta.delete(e),r.x_()&&NS(n,e),n.Ta.size===0&&(r.x_()?r.B_():Hi(n)&&n.Aa.set("Unknown"))}function tg(t,e){if(t.Ra.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(Z.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}ao(t).H_(e)}function NS(t,e){t.Ra.$e(e),ao(t).Y_(e)}function ng(t){t.Ra=new dD({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>t.Ta.get(e)||null,lt:()=>t.datastore.serializer.databaseId}),ao(t).start(),t.Aa.aa()}function rg(t){return Hi(t)&&!ao(t).M_()&&t.Ta.size>0}function Hi(t){return ee(t).Ia.size===0}function OS(t){t.Ra=void 0}async function _x(t){t.Aa.set("Online")}async function wx(t){t.Ta.forEach((e,n)=>{tg(t,e)})}async function Ex(t,e){OS(t),rg(t)?(t.Aa.la(e),ng(t)):t.Aa.set("Unknown")}async function Ix(t,e,n){if(t.Aa.set("Online"),e instanceof gS&&e.state===2&&e.cause)try{await async function(i,s){const o=s.cause;for(const l of s.targetIds)i.Ta.has(l)&&(await i.remoteSyncer.rejectListen(l,o),i.Ta.delete(l),i.Ra.removeTarget(l))}(t,e)}catch(r){H(Ni,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await wc(t,r)}else if(e instanceof ku?t.Ra.Ye(e):e instanceof mS?t.Ra.it(e):t.Ra.et(e),!n.isEqual(Z.min()))try{const r=await PS(t.localStore);n.compareTo(r)>=0&&await function(s,o){const l=s.Ra.Pt(o);return l.targetChanges.forEach((u,c)=>{if(u.resumeToken.approximateByteSize()>0){const d=s.Ta.get(c);d&&s.Ta.set(c,d.withResumeToken(u.resumeToken,o))}}),l.targetMismatches.forEach((u,c)=>{const d=s.Ta.get(u);if(!d)return;s.Ta.set(u,d.withResumeToken(Je.EMPTY_BYTE_STRING,d.snapshotVersion)),NS(s,u);const p=new Tr(d.target,u,c,d.sequenceNumber);tg(s,p)}),s.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){H(Ni,"Failed to raise snapshot:",r),await wc(t,r)}}async function wc(t,e,n){if(!so(e))throw e;t.Ia.add(1),await cl(t),t.Aa.set("Offline"),n||(n=()=>PS(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{H(Ni,"Retrying IndexedDB access"),await n(),t.Ia.delete(1),await yh(t)})}function DS(t,e){return e().catch(n=>wc(t,n,e))}async function vh(t){const e=ee(t),n=Gr(e);let r=e.Pa.length>0?e.Pa[e.Pa.length-1].batchId:$m;for(;Tx(e);)try{const i=await ix(e.localStore,r);if(i===null){e.Pa.length===0&&n.B_();break}r=i.batchId,Sx(e,i)}catch(i){await wc(e,i)}xS(e)&&MS(e)}function Tx(t){return Hi(t)&&t.Pa.length<10}function Sx(t,e){t.Pa.push(e);const n=Gr(t);n.x_()&&n.Z_&&n.X_(e.mutations)}function xS(t){return Hi(t)&&!Gr(t).M_()&&t.Pa.length>0}function MS(t){Gr(t).start()}async function Ax(t){Gr(t).na()}async function Cx(t){const e=Gr(t);for(const n of t.Pa)e.X_(n.mutations)}async function Px(t,e,n){const r=t.Pa.shift(),i=Gm.from(r,e,n);await DS(t,()=>t.remoteSyncer.applySuccessfulWrite(i)),await vh(t)}async function kx(t,e){e&&Gr(t).Z_&&await async function(r,i){if(function(o){return cD(o)&&o!==M.ABORTED}(i.code)){const s=r.Pa.shift();Gr(r).N_(),await DS(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await vh(r)}}(t,e),xS(t)&&MS(t)}async function uw(t,e){const n=ee(t);n.asyncQueue.verifyOperationInProgress(),H(Ni,"RemoteStore received new credentials");const r=Hi(n);n.Ia.add(3),await cl(n),r&&n.Aa.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ia.delete(3),await yh(n)}async function Rx(t,e){const n=ee(t);e?(n.Ia.delete(2),await yh(n)):e||(n.Ia.add(2),await cl(n),n.Aa.set("Unknown"))}function ao(t){return t.Va||(t.Va=function(n,r,i){const s=ee(n);return s.ia(),new fx(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Zo:_x.bind(null,t),e_:wx.bind(null,t),n_:Ex.bind(null,t),J_:Ix.bind(null,t)}),t.da.push(async e=>{e?(t.Va.N_(),rg(t)?ng(t):t.Aa.set("Unknown")):(await t.Va.stop(),OS(t))})),t.Va}function Gr(t){return t.ma||(t.ma=function(n,r,i){const s=ee(n);return s.ia(),new px(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Zo:()=>Promise.resolve(),e_:Ax.bind(null,t),n_:kx.bind(null,t),ea:Cx.bind(null,t),ta:Px.bind(null,t)}),t.da.push(async e=>{e?(t.ma.N_(),await vh(t)):(await t.ma.stop(),t.Pa.length>0&&(H(Ni,`Stopping write stream with ${t.Pa.length} pending writes`),t.Pa=[]))})),t.ma}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ig{constructor(e,n,r,i,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new Lr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,i,s){const o=Date.now()+r,l=new ig(e,n,o,i,s);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new z(M.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function sg(t,e){if(Yn("AsyncQueue",`${e}: ${t}`),so(t))return new z(M.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ks{static emptySet(e){return new ks(e.comparator)}constructor(e){this.comparator=e?(n,r)=>e(n,r)||G.comparator(n.key,r.key):(n,r)=>G.comparator(n.key,r.key),this.keyedMap=qo(),this.sortedSet=new ke(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof ks)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new ks;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cw{constructor(){this.fa=new ke(G.comparator)}track(e){const n=e.doc.key,r=this.fa.get(n);r?e.type!==0&&r.type===3?this.fa=this.fa.insert(n,e):e.type===3&&r.type!==1?this.fa=this.fa.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.fa=this.fa.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.fa=this.fa.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.fa=this.fa.remove(n):e.type===1&&r.type===2?this.fa=this.fa.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.fa=this.fa.insert(n,{type:2,doc:e.doc}):Q(63341,{At:e,ga:r}):this.fa=this.fa.insert(n,e)}pa(){const e=[];return this.fa.inorderTraversal((n,r)=>{e.push(r)}),e}}class qs{constructor(e,n,r,i,s,o,l,u,c){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=l,this.excludesMetadataChanges=u,this.hasCachedResults=c}static fromInitialDocuments(e,n,r,i,s){const o=[];return n.forEach(l=>{o.push({type:0,doc:l})}),new qs(e,n,ks.emptySet(n),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&hh(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let i=0;i<n.length;i++)if(n[i].type!==r[i].type||!n[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bx{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some(e=>e.ba())}}class Nx{constructor(){this.queries=hw(),this.onlineState="Unknown",this.Da=new Set}terminate(){(function(n,r){const i=ee(n),s=i.queries;i.queries=hw(),s.forEach((o,l)=>{for(const u of l.wa)u.onError(r)})})(this,new z(M.ABORTED,"Firestore shutting down"))}}function hw(){return new zi(t=>tS(t),hh)}async function LS(t,e){const n=ee(t);let r=3;const i=e.query;let s=n.queries.get(i);s?!s.Sa()&&e.ba()&&(r=2):(s=new bx,r=e.ba()?0:1);try{switch(r){case 0:s.ya=await n.onListen(i,!0);break;case 1:s.ya=await n.onListen(i,!1);break;case 2:await n.onFirstRemoteStoreListen(i)}}catch(o){const l=sg(o,`Initialization of query '${ts(e.query)}' failed`);return void e.onError(l)}n.queries.set(i,s),s.wa.push(e),e.va(n.onlineState),s.ya&&e.Ca(s.ya)&&og(n)}async function VS(t,e){const n=ee(t),r=e.query;let i=3;const s=n.queries.get(r);if(s){const o=s.wa.indexOf(e);o>=0&&(s.wa.splice(o,1),s.wa.length===0?i=e.ba()?0:1:!s.Sa()&&e.ba()&&(i=2))}switch(i){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function Ox(t,e){const n=ee(t);let r=!1;for(const i of e){const s=i.query,o=n.queries.get(s);if(o){for(const l of o.wa)l.Ca(i)&&(r=!0);o.ya=i}}r&&og(n)}function Dx(t,e,n){const r=ee(t),i=r.queries.get(e);if(i)for(const s of i.wa)s.onError(n);r.queries.delete(e)}function og(t){t.Da.forEach(e=>{e.next()})}var Ep,dw;(dw=Ep||(Ep={})).Fa="default",dw.Cache="cache";class FS{constructor(e,n,r){this.query=e,this.Ma=n,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=r||{}}Ca(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new qs(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.xa?this.Na(e)&&(this.Ma.next(e),n=!0):this.Ba(e,this.onlineState)&&(this.La(e),n=!0),this.Oa=e,n}onError(e){this.Ma.error(e)}va(e){this.onlineState=e;let n=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,e)&&(this.La(this.Oa),n=!0),n}Ba(e,n){if(!e.fromCache||!this.ba())return!0;const r=n!=="Offline";return(!this.options.ka||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Na(e){if(e.docChanges.length>0)return!0;const n=this.Oa&&this.Oa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}La(e){e=qs.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.xa=!0,this.Ma.next(e)}ba(){return this.options.source!==Ep.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class US{constructor(e){this.key=e}}class $S{constructor(e){this.key=e}}class xx{constructor(e,n){this.query=e,this.Ha=n,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=se(),this.mutatedKeys=se(),this.Xa=nS(e),this.eu=new ks(this.Xa)}get tu(){return this.Ha}nu(e,n){const r=n?n.ru:new cw,i=n?n.eu:this.eu;let s=n?n.mutatedKeys:this.mutatedKeys,o=i,l=!1;const u=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,c=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((d,p)=>{const m=i.get(d),w=dh(this.query,p)?p:null,C=!!m&&this.mutatedKeys.has(m.key),P=!!w&&(w.hasLocalMutations||this.mutatedKeys.has(w.key)&&w.hasCommittedMutations);let N=!1;m&&w?m.data.isEqual(w.data)?C!==P&&(r.track({type:3,doc:w}),N=!0):this.iu(m,w)||(r.track({type:2,doc:w}),N=!0,(u&&this.Xa(w,u)>0||c&&this.Xa(w,c)<0)&&(l=!0)):!m&&w?(r.track({type:0,doc:w}),N=!0):m&&!w&&(r.track({type:1,doc:m}),N=!0,(u||c)&&(l=!0)),N&&(w?(o=o.add(w),s=P?s.add(d):s.delete(d)):(o=o.delete(d),s=s.delete(d)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const d=this.query.limitType==="F"?o.last():o.first();o=o.delete(d.key),s=s.delete(d.key),r.track({type:1,doc:d})}return{eu:o,ru:r,Ds:l,mutatedKeys:s}}iu(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,i){const s=this.eu;this.eu=e.eu,this.mutatedKeys=e.mutatedKeys;const o=e.ru.pa();o.sort((d,p)=>function(w,C){const P=N=>{switch(N){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Q(20277,{At:N})}};return P(w)-P(C)}(d.type,p.type)||this.Xa(d.doc,p.doc)),this.su(r),i=i!=null&&i;const l=n&&!i?this.ou():[],u=this.Za.size===0&&this.current&&!i?1:0,c=u!==this.Ya;return this.Ya=u,o.length!==0||c?{snapshot:new qs(this.query,e.eu,s,o,e.mutatedKeys,u===0,c,!1,!!r&&r.resumeToken.approximateByteSize()>0),_u:l}:{_u:l}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({eu:this.eu,ru:new cw,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(e){return!this.Ha.has(e)&&!!this.eu.has(e)&&!this.eu.get(e).hasLocalMutations}su(e){e&&(e.addedDocuments.forEach(n=>this.Ha=this.Ha.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ha=this.Ha.delete(n)),this.current=e.current)}ou(){if(!this.current)return[];const e=this.Za;this.Za=se(),this.eu.forEach(r=>{this.au(r.key)&&(this.Za=this.Za.add(r.key))});const n=[];return e.forEach(r=>{this.Za.has(r)||n.push(new $S(r))}),this.Za.forEach(r=>{e.has(r)||n.push(new US(r))}),n}uu(e){this.Ha=e.qs,this.Za=se();const n=this.nu(e.documents);return this.applyChanges(n,!0)}cu(){return qs.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,this.Ya===0,this.hasCachedResults)}}const ag="SyncEngine";class Mx{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class Lx{constructor(e){this.key=e,this.lu=!1}}class Vx{constructor(e,n,r,i,s,o){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.hu={},this.Pu=new zi(l=>tS(l),hh),this.Tu=new Map,this.Iu=new Set,this.du=new ke(G.comparator),this.Eu=new Map,this.Au=new Ym,this.Ru={},this.Vu=new Map,this.mu=Ws.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return this.fu===!0}}async function Fx(t,e,n=!0){const r=qS(t);let i;const s=r.Pu.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.cu()):i=await jS(r,e,n,!0),i}async function Ux(t,e){const n=qS(t);await jS(n,e,!0,!1)}async function jS(t,e,n,r){const i=await sx(t.localStore,_n(e)),s=i.targetId,o=t.sharedClientState.addLocalQueryTarget(s,n);let l;return r&&(l=await $x(t,e,s,o==="current",i.resumeToken)),t.isPrimaryClient&&n&&bS(t.remoteStore,i),l}async function $x(t,e,n,r,i){t.gu=(p,m,w)=>async function(P,N,I,y){let S=N.view.nu(I);S.Ds&&(S=await iw(P.localStore,N.query,!1).then(({documents:_})=>N.view.nu(_,S)));const b=y&&y.targetChanges.get(N.targetId),F=y&&y.targetMismatches.get(N.targetId)!=null,$=N.view.applyChanges(S,P.isPrimaryClient,b,F);return pw(P,N.targetId,$._u),$.snapshot}(t,p,m,w);const s=await iw(t.localStore,e,!0),o=new xx(e,s.qs),l=o.nu(s.documents),u=ul.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",i),c=o.applyChanges(l,t.isPrimaryClient,u);pw(t,n,c._u);const d=new Mx(e,n,o);return t.Pu.set(e,d),t.Tu.has(n)?t.Tu.get(n).push(e):t.Tu.set(n,[e]),c.snapshot}async function jx(t,e,n){const r=ee(t),i=r.Pu.get(e),s=r.Tu.get(i.targetId);if(s.length>1)return r.Tu.set(i.targetId,s.filter(o=>!hh(o,e))),void r.Pu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await _p(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),n&&eg(r.remoteStore,i.targetId),Ip(r,i.targetId)}).catch(io)):(Ip(r,i.targetId),await _p(r.localStore,i.targetId,!0))}async function Bx(t,e){const n=ee(t),r=n.Pu.get(e),i=n.Tu.get(r.targetId);n.isPrimaryClient&&i.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),eg(n.remoteStore,r.targetId))}async function zx(t,e,n){const r=Yx(t);try{const i=await function(o,l){const u=ee(o),c=_e.now(),d=l.reduce((w,C)=>w.add(C.key),se());let p,m;return u.persistence.runTransaction("Locally write mutations","readwrite",w=>{let C=Jn(),P=se();return u.Os.getEntries(w,d).next(N=>{C=N,C.forEach((I,y)=>{y.isValidDocument()||(P=P.add(I))})}).next(()=>u.localDocuments.getOverlayedDocuments(w,C)).next(N=>{p=N;const I=[];for(const y of l){const S=sD(y,p.get(y.key).overlayedDocument);S!=null&&I.push(new ei(y.key,S,G0(S.value.mapValue),on.exists(!0)))}return u.mutationQueue.addMutationBatch(w,c,I,l)}).next(N=>{m=N;const I=N.applyToLocalDocumentSet(p,P);return u.documentOverlayCache.saveOverlays(w,N.batchId,I)})}).then(()=>({batchId:m.batchId,changes:iS(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(o,l,u){let c=o.Ru[o.currentUser.toKey()];c||(c=new ke(te)),c=c.insert(l,u),o.Ru[o.currentUser.toKey()]=c}(r,i.batchId,n),await hl(r,i.changes),await vh(r.remoteStore)}catch(i){const s=sg(i,"Failed to persist write");n.reject(s)}}async function BS(t,e){const n=ee(t);try{const r=await nx(n.localStore,e);e.targetChanges.forEach((i,s)=>{const o=n.Eu.get(s);o&&(ue(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?o.lu=!0:i.modifiedDocuments.size>0?ue(o.lu,14607):i.removedDocuments.size>0&&(ue(o.lu,42227),o.lu=!1))}),await hl(n,r,e)}catch(r){await io(r)}}function fw(t,e,n){const r=ee(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const i=[];r.Pu.forEach((s,o)=>{const l=o.view.va(e);l.snapshot&&i.push(l.snapshot)}),function(o,l){const u=ee(o);u.onlineState=l;let c=!1;u.queries.forEach((d,p)=>{for(const m of p.wa)m.va(l)&&(c=!0)}),c&&og(u)}(r.eventManager,e),i.length&&r.hu.J_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function Hx(t,e,n){const r=ee(t);r.sharedClientState.updateQueryState(e,"rejected",n);const i=r.Eu.get(e),s=i&&i.key;if(s){let o=new ke(G.comparator);o=o.insert(s,ot.newNoDocument(s,Z.min()));const l=se().add(s),u=new mh(Z.min(),new Map,new ke(te),o,l);await BS(r,u),r.du=r.du.remove(s),r.Eu.delete(e),lg(r)}else await _p(r.localStore,e,!1).then(()=>Ip(r,e,n)).catch(io)}async function Wx(t,e){const n=ee(t),r=e.batch.batchId;try{const i=await tx(n.localStore,e);HS(n,r,null),zS(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await hl(n,i)}catch(i){await io(i)}}async function qx(t,e,n){const r=ee(t);try{const i=await function(o,l){const u=ee(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",c=>{let d;return u.mutationQueue.lookupMutationBatch(c,l).next(p=>(ue(p!==null,37113),d=p.keys(),u.mutationQueue.removeMutationBatch(c,p))).next(()=>u.mutationQueue.performConsistencyCheck(c)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(c,d,l)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(c,d)).next(()=>u.localDocuments.getDocuments(c,d))})}(r.localStore,e);HS(r,e,n),zS(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await hl(r,i)}catch(i){await io(i)}}function zS(t,e){(t.Vu.get(e)||[]).forEach(n=>{n.resolve()}),t.Vu.delete(e)}function HS(t,e,n){const r=ee(t);let i=r.Ru[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(n?s.reject(n):s.resolve(),i=i.remove(e)),r.Ru[r.currentUser.toKey()]=i}}function Ip(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Tu.get(e))t.Pu.delete(r),n&&t.hu.pu(r,n);t.Tu.delete(e),t.isPrimaryClient&&t.Au.zr(e).forEach(r=>{t.Au.containsKey(r)||WS(t,r)})}function WS(t,e){t.Iu.delete(e.path.canonicalString());const n=t.du.get(e);n!==null&&(eg(t.remoteStore,n),t.du=t.du.remove(e),t.Eu.delete(n),lg(t))}function pw(t,e,n){for(const r of n)r instanceof US?(t.Au.addReference(r.key,e),Gx(t,r)):r instanceof $S?(H(ag,"Document no longer in limbo: "+r.key),t.Au.removeReference(r.key,e),t.Au.containsKey(r.key)||WS(t,r.key)):Q(19791,{yu:r})}function Gx(t,e){const n=e.key,r=n.path.canonicalString();t.du.get(n)||t.Iu.has(r)||(H(ag,"New document in limbo: "+n),t.Iu.add(r),lg(t))}function lg(t){for(;t.Iu.size>0&&t.du.size<t.maxConcurrentLimboResolutions;){const e=t.Iu.values().next().value;t.Iu.delete(e);const n=new G(pe.fromString(e)),r=t.mu.next();t.Eu.set(r,new Lx(n)),t.du=t.du.insert(n,r),bS(t.remoteStore,new Tr(_n(Wm(n.path)),r,"TargetPurposeLimboResolution",lh.ue))}}async function hl(t,e,n){const r=ee(t),i=[],s=[],o=[];r.Pu.isEmpty()||(r.Pu.forEach((l,u)=>{o.push(r.gu(u,e,n).then(c=>{var d;if((c||n)&&r.isPrimaryClient){const p=c?!c.fromCache:(d=n==null?void 0:n.targetChanges.get(u.targetId))===null||d===void 0?void 0:d.current;r.sharedClientState.updateQueryState(u.targetId,p?"current":"not-current")}if(c){i.push(c);const p=Xm.Es(u.targetId,c);s.push(p)}}))}),await Promise.all(o),r.hu.J_(i),await async function(u,c){const d=ee(u);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>V.forEach(c,m=>V.forEach(m.Is,w=>d.persistence.referenceDelegate.addReference(p,m.targetId,w)).next(()=>V.forEach(m.ds,w=>d.persistence.referenceDelegate.removeReference(p,m.targetId,w)))))}catch(p){if(!so(p))throw p;H(Zm,"Failed to update sequence numbers: "+p)}for(const p of c){const m=p.targetId;if(!p.fromCache){const w=d.Fs.get(m),C=w.snapshotVersion,P=w.withLastLimboFreeSnapshotVersion(C);d.Fs=d.Fs.insert(m,P)}}}(r.localStore,s))}async function Kx(t,e){const n=ee(t);if(!n.currentUser.isEqual(e)){H(ag,"User change. New user:",e.toKey());const r=await CS(n.localStore,e);n.currentUser=e,function(s,o){s.Vu.forEach(l=>{l.forEach(u=>{u.reject(new z(M.CANCELLED,o))})}),s.Vu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await hl(n,r.Bs)}}function Qx(t,e){const n=ee(t),r=n.Eu.get(e);if(r&&r.lu)return se().add(r.key);{let i=se();const s=n.Tu.get(e);if(!s)return i;for(const o of s){const l=n.Pu.get(o);i=i.unionWith(l.view.tu)}return i}}function qS(t){const e=ee(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=BS.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Qx.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Hx.bind(null,e),e.hu.J_=Ox.bind(null,e.eventManager),e.hu.pu=Dx.bind(null,e.eventManager),e}function Yx(t){const e=ee(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=Wx.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=qx.bind(null,e),e}class Ec{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=gh(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Du(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Cu(e,this.localStore),this.indexBackfillerScheduler=this.Fu(e,this.localStore)}Cu(e,n){return null}Fu(e,n){return null}vu(e){return ex(this.persistence,new JD,e.initialUser,this.serializer)}Du(e){return new AS(Jm.Vi,this.serializer)}bu(e){return new ax}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ec.provider={build:()=>new Ec};class Jx extends Ec{constructor(e){super(),this.cacheSizeBytes=e}Cu(e,n){ue(this.persistence.referenceDelegate instanceof _c,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new LD(r,e.asyncQueue,n)}Du(e){const n=this.cacheSizeBytes!==void 0?vt.withCacheSize(this.cacheSizeBytes):vt.DEFAULT;return new AS(r=>_c.Vi(r,n),this.serializer)}}class Tp{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>fw(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Kx.bind(null,this.syncEngine),await Rx(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new Nx}()}createDatastore(e){const n=gh(e.databaseInfo.databaseId),r=function(s){return new dx(s)}(e.databaseInfo);return function(s,o,l,u){return new gx(s,o,l,u)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,i,s,o,l){return new vx(r,i,s,o,l)}(this.localStore,this.datastore,e.asyncQueue,n=>fw(this.syncEngine,n,0),function(){return aw.C()?new aw:new lx}())}createSyncEngine(e,n){return function(i,s,o,l,u,c,d){const p=new Vx(i,s,o,l,u,c);return d&&(p.fu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(i){const s=ee(i);H(Ni,"RemoteStore shutting down."),s.Ia.add(5),await cl(s),s.Ea.shutdown(),s.Aa.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}Tp.provider={build:()=>new Tp};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GS{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.xu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.xu(this.observer.error,e):Yn("Uncaught Error in snapshot listener:",e.toString()))}Ou(){this.muted=!0}xu(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kr="FirestoreClient";class Xx{constructor(e,n,r,i,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=i,this.user=it.UNAUTHENTICATED,this.clientId=Um.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async o=>{H(Kr,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(H(Kr,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Lr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=sg(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Bd(t,e){t.asyncQueue.verifyOperationInProgress(),H(Kr,"Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async i=>{r.isEqual(i)||(await CS(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>{Br("Terminating Firestore due to IndexedDb database deletion"),t.terminate().then(()=>{H("Terminating Firestore due to IndexedDb database deletion completed successfully")}).catch(i=>{Br("Terminating Firestore due to IndexedDb database deletion failed",i)})}),t._offlineComponents=e}async function mw(t,e){t.asyncQueue.verifyOperationInProgress();const n=await Zx(t);H(Kr,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>uw(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,i)=>uw(e.remoteStore,i)),t._onlineComponents=e}async function Zx(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){H(Kr,"Using user provided OfflineComponentProvider");try{await Bd(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(i){return i.name==="FirebaseError"?i.code===M.FAILED_PRECONDITION||i.code===M.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(n))throw n;Br("Error using user provided cache. Falling back to memory cache: "+n),await Bd(t,new Ec)}}else H(Kr,"Using default OfflineComponentProvider"),await Bd(t,new Jx(void 0));return t._offlineComponents}async function KS(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(H(Kr,"Using user provided OnlineComponentProvider"),await mw(t,t._uninitializedComponentsProvider._online)):(H(Kr,"Using default OnlineComponentProvider"),await mw(t,new Tp))),t._onlineComponents}function eM(t){return KS(t).then(e=>e.syncEngine)}async function Sp(t){const e=await KS(t),n=e.eventManager;return n.onListen=Fx.bind(null,e.syncEngine),n.onUnlisten=jx.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=Ux.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=Bx.bind(null,e.syncEngine),n}function tM(t,e,n={}){const r=new Lr;return t.asyncQueue.enqueueAndForget(async()=>function(s,o,l,u,c){const d=new GS({next:m=>{d.Ou(),o.enqueueAndForget(()=>VS(s,p)),m.fromCache&&u.source==="server"?c.reject(new z(M.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(m)},error:m=>c.reject(m)}),p=new FS(l,d,{includeMetadataChanges:!0,ka:!0});return LS(s,p)}(await Sp(t),t.asyncQueue,e,n,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QS(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gw=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YS="firestore.googleapis.com",yw=!0;class vw{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new z(M.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=YS,this.ssl=yw}else this.host=e.host,this.ssl=(n=e.ssl)!==null&&n!==void 0?n:yw;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=SS;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<xD)throw new z(M.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}yO("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=QS((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new z(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new z(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new z(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class _h{constructor(e,n,r,i){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new vw({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new z(M.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new z(M.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new vw(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new lO;switch(r.type){case"firstParty":return new dO(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new z(M.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=gw.get(n);r&&(H("ComponentProvider","Removing Datastore"),gw.delete(n),r.terminate())}(this),Promise.resolve()}}function nM(t,e,n,r={}){var i;t=sn(t,_h);const s=$i(e),o=t._getSettings(),l=Object.assign(Object.assign({},o),{emulatorOptions:t._getEmulatorOptions()}),u=`${e}:${n}`;s&&(xm(`https://${u}`),Mm("Firestore",!0)),o.host!==YS&&o.host!==u&&Br("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c=Object.assign(Object.assign({},o),{host:u,ssl:s,emulatorOptions:r});if(!Ri(c,l)&&(t._setSettings(c),r.mockUserToken)){let d,p;if(typeof r.mockUserToken=="string")d=r.mockUserToken,p=it.MOCK_USER;else{d=xb(r.mockUserToken,(i=t._app)===null||i===void 0?void 0:i.options.projectId);const m=r.mockUserToken.sub||r.mockUserToken.user_id;if(!m)throw new z(M.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new it(m)}t._authCredentials=new uO(new x0(d,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ir{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new ir(this.firestore,e,this._query)}}class xe{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Vr(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new xe(this.firestore,e,this._key)}toJSON(){return{type:xe._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,r){if(al(n,xe._jsonSchema))return new xe(e,r||null,new G(pe.fromString(n.referencePath)))}}xe._jsonSchemaVersion="firestore/documentReference/1.0",xe._jsonSchema={type:Fe("string",xe._jsonSchemaVersion),referencePath:Fe("string")};class Vr extends ir{constructor(e,n,r){super(e,n,Wm(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new xe(this.firestore,null,new G(e))}withConverter(e){return new Vr(this.firestore,e,this._path)}}function Rt(t,e,...n){if(t=Ie(t),L0("collection","path",e),t instanceof _h){const r=pe.fromString(e,...n);return N_(r),new Vr(t,null,r)}{if(!(t instanceof xe||t instanceof Vr))throw new z(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(pe.fromString(e,...n));return N_(r),new Vr(t.firestore,null,r)}}function Gs(t,e,...n){if(t=Ie(t),arguments.length===1&&(e=Um.newId()),L0("doc","path",e),t instanceof _h){const r=pe.fromString(e,...n);return b_(r),new xe(t,null,new G(r))}{if(!(t instanceof xe||t instanceof Vr))throw new z(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(pe.fromString(e,...n));return b_(r),new xe(t.firestore,t instanceof Vr?t.converter:null,new G(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _w="AsyncQueue";class ww{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new kS(this,"async_queue_retry"),this.oc=()=>{const r=jd();r&&H(_w,"Visibility state changed to "+r.visibilityState),this.F_.y_()},this._c=e;const n=jd();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const n=jd();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise(()=>{});const n=new Lr;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Zu.push(e),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!so(e))throw e;H(_w,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(e){const n=this._c.then(()=>(this.nc=!0,e().catch(r=>{throw this.tc=r,this.nc=!1,Yn("INTERNAL UNHANDLED ERROR: ",Ew(r)),r}).then(r=>(this.nc=!1,r))));return this._c=n,n}enqueueAfterDelay(e,n,r){this.ac(),this.sc.indexOf(e)>-1&&(n=0);const i=ig.createAndSchedule(this,e,n,r,s=>this.lc(s));return this.ec.push(i),i}ac(){this.tc&&Q(47125,{hc:Ew(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(const n of this.ec)if(n.timerId===e)return!0;return!1}Ic(e){return this.Pc().then(()=>{this.ec.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.ec)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Pc()})}dc(e){this.sc.push(e)}lc(e){const n=this.ec.indexOf(e);this.ec.splice(n,1)}}function Ew(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Iw(t){return function(n,r){if(typeof n!="object"||n===null)return!1;const i=n;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1}(t,["next","error","complete"])}class Oi extends _h{constructor(e,n,r,i){super(e,n,r,i),this.type="firestore",this._queue=new ww,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new ww(e),this._firestoreClient=void 0,await e}}}function rM(t,e){const n=typeof t=="object"?t:oh(),r=typeof t=="string"?t:fc,i=Bi(n,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=g0("firestore");s&&nM(i,...s)}return i}function ug(t){if(t._terminated)throw new z(M.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||iM(t),t._firestoreClient}function iM(t){var e,n,r;const i=t._freezeSettings(),s=function(l,u,c,d){return new RO(l,u,c,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,QS(d.experimentalLongPollingOptions),d.useFetchStreams,d.isUsingEmulator)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,i);t._componentsProvider||!((n=i.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),t._firestoreClient=new Xx(t._authCredentials,t._appCheckCredentials,t._queue,s,t._componentsProvider&&function(l){const u=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(u),_online:u}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new zt(Je.fromBase64String(e))}catch(n){throw new z(M.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new zt(Je.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:zt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(al(e,zt._jsonSchema))return zt.fromBase64String(e.bytes)}}zt._jsonSchemaVersion="firestore/bytes/1.0",zt._jsonSchema={type:Fe("string",zt._jsonSchemaVersion),bytes:Fe("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wh{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new z(M.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ke(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eh{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class En{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new z(M.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new z(M.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return te(this._lat,e._lat)||te(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:En._jsonSchemaVersion}}static fromJSON(e){if(al(e,En._jsonSchema))return new En(e.latitude,e.longitude)}}En._jsonSchemaVersion="firestore/geoPoint/1.0",En._jsonSchema={type:Fe("string",En._jsonSchemaVersion),latitude:Fe("number"),longitude:Fe("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class In{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:In._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(al(e,In._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new In(e.vectorValues);throw new z(M.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}In._jsonSchemaVersion="firestore/vectorValue/1.0",In._jsonSchema={type:Fe("string",In._jsonSchemaVersion),vectorValues:Fe("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sM=/^__.*__$/;class oM{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new ei(e,this.data,this.fieldMask,n,this.fieldTransforms):new ll(e,this.data,n,this.fieldTransforms)}}class JS{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new ei(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function XS(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Q(40011,{Ec:t})}}class cg{constructor(e,n,r,i,s,o){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.Ac(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(e){return new cg(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),i=this.Rc({path:r,mc:!1});return i.fc(e),i}gc(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),i=this.Rc({path:r,mc:!1});return i.Ac(),i}yc(e){return this.Rc({path:void 0,mc:!0})}wc(e){return Ic(e,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.fc(this.path.get(e))}fc(e){if(e.length===0)throw this.wc("Document fields must not be empty");if(XS(this.Ec)&&sM.test(e))throw this.wc('Document fields cannot begin and end with "__"')}}class aM{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||gh(e)}Dc(e,n,r,i=!1){return new cg({Ec:e,methodName:n,bc:r,path:Ke.emptyPath(),mc:!1,Sc:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ih(t){const e=t._freezeSettings(),n=gh(t._databaseId);return new aM(t._databaseId,!!e.ignoreUndefinedProperties,n)}function ZS(t,e,n,r,i,s={}){const o=t.Dc(s.merge||s.mergeFields?2:0,e,n,i);dg("Data must be an object, but it was:",o,r);const l=eA(r,o);let u,c;if(s.merge)u=new Ot(o.fieldMask),c=o.fieldTransforms;else if(s.mergeFields){const d=[];for(const p of s.mergeFields){const m=Ap(e,p,n);if(!o.contains(m))throw new z(M.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);nA(d,m)||d.push(m)}u=new Ot(d),c=o.fieldTransforms.filter(p=>u.covers(p.field))}else u=null,c=o.fieldTransforms;return new oM(new wt(l),u,c)}class Th extends Eh{_toFieldTransform(e){if(e.Ec!==2)throw e.Ec===1?e.wc(`${this._methodName}() can only appear at the top level of your update data`):e.wc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Th}}class hg extends Eh{_toFieldTransform(e){return new tD(e.path,new ja)}isEqual(e){return e instanceof hg}}function lM(t,e,n,r){const i=t.Dc(1,e,n);dg("Data must be an object, but it was:",i,r);const s=[],o=wt.empty();Zr(r,(u,c)=>{const d=fg(e,u,n);c=Ie(c);const p=i.gc(d);if(c instanceof Th)s.push(d);else{const m=dl(c,p);m!=null&&(s.push(d),o.set(d,m))}});const l=new Ot(s);return new JS(o,l,i.fieldTransforms)}function uM(t,e,n,r,i,s){const o=t.Dc(1,e,n),l=[Ap(e,r,n)],u=[i];if(s.length%2!=0)throw new z(M.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let m=0;m<s.length;m+=2)l.push(Ap(e,s[m])),u.push(s[m+1]);const c=[],d=wt.empty();for(let m=l.length-1;m>=0;--m)if(!nA(c,l[m])){const w=l[m];let C=u[m];C=Ie(C);const P=o.gc(w);if(C instanceof Th)c.push(w);else{const N=dl(C,P);N!=null&&(c.push(w),d.set(w,N))}}const p=new Ot(c);return new JS(d,p,o.fieldTransforms)}function cM(t,e,n,r=!1){return dl(n,t.Dc(r?4:3,e))}function dl(t,e){if(tA(t=Ie(t)))return dg("Unsupported field value:",e,t),eA(t,e);if(t instanceof Eh)return function(r,i){if(!XS(i.Ec))throw i.wc(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.wc(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.mc&&e.Ec!==4)throw e.wc("Nested arrays are not supported");return function(r,i){const s=[];let o=0;for(const l of r){let u=dl(l,i.yc(o));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),o++}return{arrayValue:{values:s}}}(t,e)}return function(r,i){if((r=Ie(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return XO(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=_e.fromDate(r);return{timestampValue:vc(i.serializer,s)}}if(r instanceof _e){const s=new _e(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:vc(i.serializer,s)}}if(r instanceof En)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof zt)return{bytesValue:yS(i.serializer,r._byteString)};if(r instanceof xe){const s=i.databaseId,o=r.firestore._databaseId;if(!o.isEqual(s))throw i.wc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:Qm(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof In)return function(o,l){return{mapValue:{fields:{[W0]:{stringValue:q0},[pc]:{arrayValue:{values:o.toArray().map(c=>{if(typeof c!="number")throw l.wc("VectorValues must only contain numeric values.");return qm(l.serializer,c)})}}}}}}(r,i);throw i.wc(`Unsupported field value: ${ah(r)}`)}(t,e)}function eA(t,e){const n={};return U0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Zr(t,(r,i)=>{const s=dl(i,e.Vc(r));s!=null&&(n[r]=s)}),{mapValue:{fields:n}}}function tA(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof _e||t instanceof En||t instanceof zt||t instanceof xe||t instanceof Eh||t instanceof In)}function dg(t,e,n){if(!tA(n)||!V0(n)){const r=ah(n);throw r==="an object"?e.wc(t+" a custom object"):e.wc(t+" "+r)}}function Ap(t,e,n){if((e=Ie(e))instanceof wh)return e._internalPath;if(typeof e=="string")return fg(t,e);throw Ic("Field path arguments must be of type string or ",t,!1,void 0,n)}const hM=new RegExp("[~\\*/\\[\\]]");function fg(t,e,n){if(e.search(hM)>=0)throw Ic(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new wh(...e.split("."))._internalPath}catch{throw Ic(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Ic(t,e,n,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${r}`),o&&(u+=` in document ${i}`),u+=")"),new z(M.INVALID_ARGUMENT,l+t+u)}function nA(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rA{constructor(e,n,r,i,s){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new xe(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new dM(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(Sh("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class dM extends rA{data(){return super.data()}}function Sh(t,e){return typeof e=="string"?fg(t,e):e instanceof wh?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iA(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new z(M.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class pg{}class mg extends pg{}function mn(t,e,...n){let r=[];e instanceof pg&&r.push(e),r=r.concat(n),function(s){const o=s.filter(u=>u instanceof gg).length,l=s.filter(u=>u instanceof Ah).length;if(o>1||o>0&&l>0)throw new z(M.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)t=i._apply(t);return t}class Ah extends mg{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new Ah(e,n,r)}_apply(e){const n=this._parse(e);return oA(e._query,n),new ir(e.firestore,e.converter,pp(e._query,n))}_parse(e){const n=Ih(e.firestore);return function(s,o,l,u,c,d,p){let m;if(c.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new z(M.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){Sw(p,d);const C=[];for(const P of p)C.push(Tw(u,s,P));m={arrayValue:{values:C}}}else m=Tw(u,s,p)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||Sw(p,d),m=cM(l,o,p,d==="in"||d==="not-in");return Ve.create(c,d,m)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function Ut(t,e,n){const r=e,i=Sh("where",t);return Ah._create(i,r,n)}class gg extends pg{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new gg(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:un.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(i,s){let o=i;const l=s.getFlattenedFilters();for(const u of l)oA(o,u),o=pp(o,u)}(e._query,n),new ir(e.firestore,e.converter,pp(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class yg extends mg{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new yg(e,n)}_apply(e){const n=function(i,s,o){if(i.startAt!==null)throw new z(M.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new z(M.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new $a(s,o)}(e._query,this._field,this._direction);return new ir(e.firestore,e.converter,function(i,s){const o=i.explicitOrderBy.concat([s]);return new oo(i.path,i.collectionGroup,o,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)}(e._query,n))}}function yi(t,e="asc"){const n=e,r=Sh("orderBy",t);return yg._create(r,n)}class vg extends mg{constructor(e,n,r){super(),this.type=e,this._limit=n,this._limitType=r}static _create(e,n,r){return new vg(e,n,r)}_apply(e){return new ir(e.firestore,e.converter,gc(e._query,this._limit,this._limitType))}}function sA(t){return vO("limit",t),vg._create("limit",t,"F")}function Tw(t,e,n){if(typeof(n=Ie(n))=="string"){if(n==="")throw new z(M.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!eS(e)&&n.indexOf("/")!==-1)throw new z(M.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(pe.fromString(n));if(!G.isDocumentKey(r))throw new z(M.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return U_(t,new G(r))}if(n instanceof xe)return U_(t,n._key);throw new z(M.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ah(n)}.`)}function Sw(t,e){if(!Array.isArray(t)||t.length===0)throw new z(M.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function oA(t,e){const n=function(i,s){for(const o of i)for(const l of o.getFlattenedFilters())if(s.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new z(M.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new z(M.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class fM{convertValue(e,n="none"){switch(qr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Oe(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Wr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw Q(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return Zr(e,(i,s)=>{r[i]=this.convertValue(s,n)}),r}convertVectorValue(e){var n,r,i;const s=(i=(r=(n=e.fields)===null||n===void 0?void 0:n[pc].arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.map(o=>Oe(o.doubleValue));return new In(s)}convertGeoPoint(e){return new En(Oe(e.latitude),Oe(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=ch(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(Va(e));default:return null}}convertTimestamp(e){const n=Hr(e);return new _e(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=pe.fromString(e);ue(TS(r),9688,{name:e});const i=new Fa(r.get(1),r.get(3)),s=new G(r.popFirst(5));return i.isEqual(n)||Yn(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aA(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}class Ko{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Ei extends rA{constructor(e,n,r,i,s,o){super(e,n,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new Ru(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(Sh("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new z(M.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,n={};return n.type=Ei._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}}Ei._jsonSchemaVersion="firestore/documentSnapshot/1.0",Ei._jsonSchema={type:Fe("string",Ei._jsonSchemaVersion),bundleSource:Fe("string","DocumentSnapshot"),bundleName:Fe("string"),bundle:Fe("string")};class Ru extends Ei{data(e={}){return super.data(e)}}class Ii{constructor(e,n,r,i){this._firestore=e,this._userDataWriter=n,this._snapshot=i,this.metadata=new Ko(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new Ru(this._firestore,this._userDataWriter,r.key,r,new Ko(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new z(M.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map(l=>{const u=new Ru(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Ko(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);return l.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(l=>s||l.type!==3).map(l=>{const u=new Ru(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Ko(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);let c=-1,d=-1;return l.type!==0&&(c=o.indexOf(l.doc.key),o=o.delete(l.doc.key)),l.type!==1&&(o=o.add(l.doc),d=o.indexOf(l.doc.key)),{type:pM(l.type),doc:u,oldIndex:c,newIndex:d}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new z(M.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Ii._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Um.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const n=[],r=[],i=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function pM(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Q(61501,{type:t})}}Ii._jsonSchemaVersion="firestore/querySnapshot/1.0",Ii._jsonSchema={type:Fe("string",Ii._jsonSchemaVersion),bundleSource:Fe("string","QuerySnapshot"),bundleName:Fe("string"),bundle:Fe("string")};class _g extends fM{constructor(e){super(),this.firestore=e}convertBytes(e){return new zt(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new xe(this.firestore,null,n)}}function Qo(t){t=sn(t,ir);const e=sn(t.firestore,Oi),n=ug(e),r=new _g(e);return iA(t._query),tM(n,t._query).then(i=>new Ii(e,r,t,i))}function mM(t,e,n){t=sn(t,xe);const r=sn(t.firestore,Oi),i=aA(t.converter,e,n);return wg(r,[ZS(Ih(r),"setDoc",t._key,i,t.converter!==null,n).toMutation(t._key,on.none())])}function zd(t,e,n,...r){t=sn(t,xe);const i=sn(t.firestore,Oi),s=Ih(i);let o;return o=typeof(e=Ie(e))=="string"||e instanceof wh?uM(s,"updateDoc",t._key,e,n,r):lM(s,"updateDoc",t._key,e),wg(i,[o.toMutation(t._key,on.exists(!0))])}function Hd(t,e){const n=sn(t.firestore,Oi),r=Gs(t),i=aA(t.converter,e);return wg(n,[ZS(Ih(t.firestore),"addDoc",r._key,i,t.converter!==null,{}).toMutation(r._key,on.exists(!1))]).then(()=>r)}function Ha(t,...e){var n,r,i;t=Ie(t);let s={includeMetadataChanges:!1,source:"default"},o=0;typeof e[o]!="object"||Iw(e[o])||(s=e[o++]);const l={includeMetadataChanges:s.includeMetadataChanges,source:s.source};if(Iw(e[o])){const p=e[o];e[o]=(n=p.next)===null||n===void 0?void 0:n.bind(p),e[o+1]=(r=p.error)===null||r===void 0?void 0:r.bind(p),e[o+2]=(i=p.complete)===null||i===void 0?void 0:i.bind(p)}let u,c,d;if(t instanceof xe)c=sn(t.firestore,Oi),d=Wm(t._key.path),u={next:p=>{e[o]&&e[o](gM(c,t,p))},error:e[o+1],complete:e[o+2]};else{const p=sn(t,ir);c=sn(p.firestore,Oi),d=p._query;const m=new _g(c);u={next:w=>{e[o]&&e[o](new Ii(c,m,p,w))},error:e[o+1],complete:e[o+2]},iA(t._query)}return function(m,w,C,P){const N=new GS(P),I=new FS(w,N,C);return m.asyncQueue.enqueueAndForget(async()=>LS(await Sp(m),I)),()=>{N.Ou(),m.asyncQueue.enqueueAndForget(async()=>VS(await Sp(m),I))}}(ug(c),d,l,u)}function wg(t,e){return function(r,i){const s=new Lr;return r.asyncQueue.enqueueAndForget(async()=>zx(await eM(r),i,s)),s.promise}(ug(t),e)}function gM(t,e,n){const r=n.docs.get(e._key),i=new _g(t);return new Ei(t,i,e._key,r,new Ko(n.hasPendingWrites,n.fromCache),e.converter)}function Dn(){return new hg("serverTimestamp")}(function(e,n=!0){(function(i){ro=i})(no),ln(new Kt("firestore",(r,{instanceIdentifier:i,options:s})=>{const o=r.getProvider("app").getImmediate(),l=new Oi(new cO(r.getProvider("auth-internal")),new fO(o,r.getProvider("app-check-internal")),function(c,d){if(!Object.prototype.hasOwnProperty.apply(c.options,["projectId"]))throw new z(M.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Fa(c.options.projectId,d)}(o,i),o);return s=Object.assign({useFetchStreams:n},s),l._setSettings(s),l},"PUBLIC").setMultipleInstances(!0)),Ct(A_,C_,e),Ct(A_,C_,"esm2017")})();function lo(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(t);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(t,r[i])&&(n[r[i]]=t[r[i]]);return n}function lA(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const yM=lA,uA=new ji("auth","Firebase",lA());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tc=new Lm("@firebase/auth");function vM(t,...e){Tc.logLevel<=ie.WARN&&Tc.warn(`Auth (${no}): ${t}`,...e)}function bu(t,...e){Tc.logLevel<=ie.ERROR&&Tc.error(`Auth (${no}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cn(t,...e){throw Eg(t,...e)}function Tn(t,...e){return Eg(t,...e)}function cA(t,e,n){const r=Object.assign(Object.assign({},yM()),{[e]:n});return new ji("auth","Firebase",r).create(e,{appName:t.name})}function Fr(t){return cA(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Eg(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return uA.create(t,...e)}function K(t,e,...n){if(!t)throw Eg(e,...n)}function Fn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw bu(e),new Error(e)}function Xn(t,e){t||Fn(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sc(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function _M(){return Aw()==="http:"||Aw()==="https:"}function Aw(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wM(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(_M()||$b()||"connection"in navigator)?navigator.onLine:!0}function EM(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let fl=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,Xn(n>e,"Short delay should be less than long delay!"),this.isMobile=Vb()||jb()}get(){return wM()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ig(t,e){Xn(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let hA=class{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Fn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Fn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Fn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IM={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TM=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],SM=new fl(3e4,6e4);function Wi(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function ti(t,e,n,r,i={}){return dA(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const l=sl(Object.assign({key:t.config.apiKey},o)).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const c=Object.assign({method:e,headers:u},s);return Ub()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&$i(t.emulatorConfig.host)&&(c.credentials="include"),hA.fetch()(await fA(t,t.config.apiHost,n,l),c)})}async function dA(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},IM),e);try{const i=new CM(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw lu(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const l=s.ok?o.errorMessage:o.error.message,[u,c]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw lu(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw lu(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw lu(t,"user-disabled",o);const d=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw cA(t,d,c);cn(t,d)}}catch(i){if(i instanceof rr)throw i;cn(t,"network-request-failed",{message:String(i)})}}async function Ch(t,e,n,r,i={}){const s=await ti(t,e,n,r,i);return"mfaPendingCredential"in s&&cn(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function fA(t,e,n,r){const i=`${e}${n}?${r}`,s=t,o=s.config.emulator?Ig(t.config,i):`${t.config.apiScheme}://${i}`;return TM.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}function AM(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}let CM=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(Tn(this.auth,"network-request-failed")),SM.get())})}};function lu(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=Tn(t,e,r);return i.customData._tokenResponse=n,i}function Cw(t){return t!==void 0&&t.enterprise!==void 0}class PM{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return AM(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function kM(t,e){return ti(t,"GET","/v2/recaptchaConfig",Wi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function RM(t,e){return ti(t,"POST","/v1/accounts:delete",e)}async function Ac(t,e){return ti(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function da(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function bM(t,e=!1){const n=Ie(t),r=await n.getIdToken(e),i=Tg(r);K(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:da(Wd(i.auth_time)),issuedAtTime:da(Wd(i.iat)),expirationTime:da(Wd(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Wd(t){return Number(t)*1e3}function Tg(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return bu("JWT malformed, contained fewer than 3 sections"),null;try{const i=p0(n);return i?JSON.parse(i):(bu("Failed to decode base64 JWT payload"),null)}catch(i){return bu("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Pw(t){const e=Tg(t);return K(e,"internal-error"),K(typeof e.exp<"u","internal-error"),K(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Wa(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof rr&&NM(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function NM({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let OM=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Cp=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=da(this.lastLoginAt),this.creationTime=da(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Cc(t){var e;const n=t.auth,r=await t.getIdToken(),i=await Wa(t,Ac(n,{idToken:r}));K(i==null?void 0:i.users.length,n,"internal-error");const s=i.users[0];t._notifyReloadListener(s);const o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?pA(s.providerUserInfo):[],l=xM(t.providerData,o),u=t.isAnonymous,c=!(t.email&&s.passwordHash)&&!(l!=null&&l.length),d=u?c:!1,p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:l,metadata:new Cp(s.createdAt,s.lastLoginAt),isAnonymous:d};Object.assign(t,p)}async function DM(t){const e=Ie(t);await Cc(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function xM(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function pA(t){return t.map(e=>{var{providerId:n}=e,r=lo(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function MM(t,e){const n=await dA(t,{},async()=>{const r=sl({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await fA(t,i,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:l,body:r};return t.emulatorConfig&&$i(t.emulatorConfig.host)&&(u.credentials="include"),hA.fetch()(o,u)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function LM(t,e){return ti(t,"POST","/v2/accounts:revokeToken",Wi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qd=class Pp{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){K(e.idToken,"internal-error"),K(typeof e.idToken<"u","internal-error"),K(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Pw(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){K(e.length!==0,"internal-error");const n=Pw(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(K(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await MM(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new Pp;return r&&(K(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(K(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(K(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Pp,this.toJSON())}_performRefresh(){return Fn("not implemented")}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ur(t,e){K(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}let ws=class Yo{constructor(e){var{uid:n,auth:r,stsTokenManager:i}=e,s=lo(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new OM(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Cp(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const n=await Wa(this,this.stsTokenManager.getToken(this.auth,e));return K(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return bM(this,e)}reload(){return DM(this)}_assign(e){this!==e&&(K(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Yo(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){K(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await Cc(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Bt(this.auth.app))return Promise.reject(Fr(this.auth));const e=await this.getIdToken();return await Wa(this,RM(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,i,s,o,l,u,c,d;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,m=(i=n.email)!==null&&i!==void 0?i:void 0,w=(s=n.phoneNumber)!==null&&s!==void 0?s:void 0,C=(o=n.photoURL)!==null&&o!==void 0?o:void 0,P=(l=n.tenantId)!==null&&l!==void 0?l:void 0,N=(u=n._redirectEventId)!==null&&u!==void 0?u:void 0,I=(c=n.createdAt)!==null&&c!==void 0?c:void 0,y=(d=n.lastLoginAt)!==null&&d!==void 0?d:void 0,{uid:S,emailVerified:b,isAnonymous:F,providerData:$,stsTokenManager:_}=n;K(S&&_,e,"internal-error");const v=qd.fromJSON(this.name,_);K(typeof S=="string",e,"internal-error"),ur(p,e.name),ur(m,e.name),K(typeof b=="boolean",e,"internal-error"),K(typeof F=="boolean",e,"internal-error"),ur(w,e.name),ur(C,e.name),ur(P,e.name),ur(N,e.name),ur(I,e.name),ur(y,e.name);const E=new Yo({uid:S,auth:e,email:m,emailVerified:b,displayName:p,isAnonymous:F,photoURL:C,phoneNumber:w,tenantId:P,stsTokenManager:v,createdAt:I,lastLoginAt:y});return $&&Array.isArray($)&&(E.providerData=$.map(T=>Object.assign({},T))),N&&(E._redirectEventId=N),E}static async _fromIdTokenResponse(e,n,r=!1){const i=new qd;i.updateFromServerResponse(n);const s=new Yo({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await Cc(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];K(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?pA(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new qd;l.updateFromIdToken(r);const u=new Yo({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),c={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Cp(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,c),u}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kw=new Map;function Un(t){Xn(t instanceof Function,"Expected a class definition");let e=kw.get(t);return e?(Xn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,kw.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let mA=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};mA.type="NONE";const Rw=mA;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nu(t,e,n){return`firebase:${t}:${e}:${n}`}let bw=class Ou{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Nu(this.userKey,i.apiKey,s),this.fullPersistenceKey=Nu("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Ac(this.auth,{idToken:e}).catch(()=>{});return n?ws._fromGetAccountInfoResponse(this.auth,n,e):null}return ws._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Ou(Un(Rw),e,r);const i=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c);let s=i[0]||Un(Rw);const o=Nu(r,e.config.apiKey,e.name);let l=null;for(const c of n)try{const d=await c._get(o);if(d){let p;if(typeof d=="string"){const m=await Ac(e,{idToken:d}).catch(()=>{});if(!m)break;p=await ws._fromGetAccountInfoResponse(e,m,d)}else p=ws._fromJSON(e,d);c!==s&&(l=p),s=c;break}}catch{}const u=i.filter(c=>c._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Ou(s,e,r):(s=u[0],l&&await s._set(o,l.toJSON()),await Promise.all(n.map(async c=>{if(c!==s)try{await c._remove(o)}catch{}})),new Ou(s,e,r))}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nw(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(_A(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(gA(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(EA(e))return"Blackberry";if(IA(e))return"Webos";if(yA(e))return"Safari";if((e.includes("chrome/")||vA(e))&&!e.includes("edge/"))return"Chrome";if(wA(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function gA(t=ut()){return/firefox\//i.test(t)}function yA(t=ut()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function vA(t=ut()){return/crios\//i.test(t)}function _A(t=ut()){return/iemobile/i.test(t)}function wA(t=ut()){return/android/i.test(t)}function EA(t=ut()){return/blackberry/i.test(t)}function IA(t=ut()){return/webos/i.test(t)}function Sg(t=ut()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function VM(t=ut()){var e;return Sg(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function FM(){return Bb()&&document.documentMode===10}function TA(t=ut()){return Sg(t)||wA(t)||IA(t)||EA(t)||/windows phone/i.test(t)||_A(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SA(t,e=[]){let n;switch(t){case"Browser":n=Nw(ut());break;case"Worker":n=`${Nw(ut())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${no}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let UM=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,l)=>{try{const u=e(s);o(u)}catch(u){l(u)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $M(t,e={}){return ti(t,"GET","/v2/passwordPolicy",Wi(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jM=6;let BM=class{constructor(e){var n,r,i,s;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=o.minPasswordLength)!==null&&n!==void 0?n:jM,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,i,s,o,l;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(n=u.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(i=u.containsLowercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(s=u.containsUppercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(l=u.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),u}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let zM=class{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Ow(this),this.idTokenSubscription=new Ow(this),this.beforeStateQueue=new UM(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=uA,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Un(n)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await bw.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((i=this._popupRedirectResolver)===null||i===void 0)&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Ac(this,{idToken:e}),r=await ws._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(Bt(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=i==null?void 0:i._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===l)&&(u!=null&&u.user)&&(i=u.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return K(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Cc(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=EM()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Bt(this.app))return Promise.reject(Fr(this));const n=e?Ie(e):null;return n&&K(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&K(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Bt(this.app)?Promise.reject(Fr(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Bt(this.app)?Promise.reject(Fr(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Un(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await $M(this),n=new BM(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ji("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await LM(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Un(e)||this._popupRedirectResolver;K(n,this,"argument-error"),this.redirectPersistenceManager=await bw.create(this,[Un(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(K(l,this,"internal-error"),l.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const u=e.addObserver(n,r,i);return()=>{o=!0,u()}}else{const u=e.addObserver(n);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return K(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=SA(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(n["X-Firebase-AppCheck"]=i),n}async _getAppCheckToken(){var e;if(Bt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&vM(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}};function pl(t){return Ie(t)}let Ow=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=Qb(n=>this.observer=n)}get next(){return K(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ph={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function HM(t){Ph=t}function AA(t){return Ph.loadJS(t)}function WM(){return Ph.recaptchaEnterpriseScript}function qM(){return Ph.gapiScript}function GM(t){return`__${t}${Math.floor(Math.random()*1e6)}`}class KM{constructor(){this.enterprise=new QM}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class QM{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const YM="recaptcha-enterprise",CA="NO_RECAPTCHA";class JM{constructor(e){this.type=YM,this.auth=pl(e)}async verify(e="verify",n=!1){async function r(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,l)=>{kM(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{const c=new PM(u);return s.tenantId==null?s._agentRecaptchaConfig=c:s._tenantRecaptchaConfigs[s.tenantId]=c,o(c.siteKey)}}).catch(u=>{l(u)})})}function i(s,o,l){const u=window.grecaptcha;Cw(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(c=>{o(c)}).catch(()=>{o(CA)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new KM().execute("siteKey",{action:"verify"}):new Promise((s,o)=>{r(this.auth).then(l=>{if(!n&&Cw(window.grecaptcha))i(l,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=WM();u.length!==0&&(u+=l),AA(u).then(()=>{i(l,s,o)}).catch(c=>{o(c)})}}).catch(l=>{o(l)})})}}async function Dw(t,e,n,r=!1,i=!1){const s=new JM(t);let o;if(i)o=CA;else try{o=await s.verify(n)}catch{o=await s.verify(n,!0)}const l=Object.assign({},e);if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in l){const u=l.phoneEnrollmentInfo.phoneNumber,c=l.phoneEnrollmentInfo.recaptchaToken;Object.assign(l,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in l){const u=l.phoneSignInInfo.recaptchaToken;Object.assign(l,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return l}return r?Object.assign(l,{captchaResp:o}):Object.assign(l,{captchaResponse:o}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function xw(t,e,n,r,i){var s;if(!((s=t._getRecaptchaConfig())===null||s===void 0)&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await Dw(t,e,n,n==="getOobCode");return r(t,o)}else return r(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const l=await Dw(t,e,n,n==="getOobCode");return r(t,l)}else return Promise.reject(o)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function XM(t,e){const n=Bi(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if(Ri(s,e??{}))return i;cn(i,"already-initialized")}return n.initialize({options:e})}function ZM(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(Un);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function e2(t,e,n){const r=pl(t);K(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=PA(e),{host:o,port:l}=t2(e),u=l===null?"":`:${l}`,c={url:`${s}//${o}${u}/`},d=Object.freeze({host:o,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){K(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),K(Ri(c,r.config.emulator)&&Ri(d,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=c,r.emulatorConfig=d,r.settings.appVerificationDisabledForTesting=!0,$i(o)?(xm(`${s}//${o}${u}`),Mm("Auth",!0)):n2()}function PA(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function t2(t){const e=PA(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:Mw(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:Mw(o)}}}function Mw(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function n2(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ag=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Fn("not implemented")}_getIdTokenResponse(e){return Fn("not implemented")}_linkToIdToken(e,n){return Fn("not implemented")}_getReauthenticationResolver(e){return Fn("not implemented")}};async function r2(t,e){return ti(t,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function i2(t,e){return Ch(t,"POST","/v1/accounts:signInWithPassword",Wi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function s2(t,e){return Ch(t,"POST","/v1/accounts:signInWithEmailLink",Wi(t,e))}async function o2(t,e){return Ch(t,"POST","/v1/accounts:signInWithEmailLink",Wi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qa extends Ag{constructor(e,n,r,i=null){super("password",r),this._email=e,this._password=n,this._tenantId=i}static _fromEmailAndPassword(e,n){return new qa(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new qa(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return xw(e,n,"signInWithPassword",i2);case"emailLink":return s2(e,{email:this._email,oobCode:this._password});default:cn(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return xw(e,r,"signUpPassword",r2);case"emailLink":return o2(e,{idToken:n,email:this._email,oobCode:this._password});default:cn(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Rs(t,e){return Ch(t,"POST","/v1/accounts:signInWithIdp",Wi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const a2="http://localhost";let kh=class kp extends Ag{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new kp(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):cn("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=n,s=lo(n,["providerId","signInMethod"]);if(!r||!i)return null;const o=new kp(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Rs(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Rs(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Rs(e,n)}buildRequest(){const e={requestUri:a2,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=sl(n)}return e}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function l2(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function u2(t){const e=zo(Ho(t)).link,n=e?zo(Ho(e)).deep_link_id:null,r=zo(Ho(t)).deep_link_id;return(r?zo(Ho(r)).link:null)||r||n||e||t}class Rh{constructor(e){var n,r,i,s,o,l;const u=zo(Ho(e)),c=(n=u.apiKey)!==null&&n!==void 0?n:null,d=(r=u.oobCode)!==null&&r!==void 0?r:null,p=l2((i=u.mode)!==null&&i!==void 0?i:null);K(c&&d&&p,"argument-error"),this.apiKey=c,this.operation=p,this.code=d,this.continueUrl=(s=u.continueUrl)!==null&&s!==void 0?s:null,this.languageCode=(o=u.lang)!==null&&o!==void 0?o:null,this.tenantId=(l=u.tenantId)!==null&&l!==void 0?l:null}static parseLink(e){const n=u2(e);try{return new Rh(n)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uo{constructor(){this.providerId=uo.PROVIDER_ID}static credential(e,n){return qa._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=Rh.parseLink(n);return K(r,"argument-error"),qa._fromEmailAndCode(e,r.code,r.tenantId)}}uo.PROVIDER_ID="password";uo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";uo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let kA=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ml=class extends kA{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let RA=class is extends ml{constructor(){super("facebook.com")}static credential(e){return kh._fromParams({providerId:is.PROVIDER_ID,signInMethod:is.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return is.credentialFromTaggedObject(e)}static credentialFromError(e){return is.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return is.credential(e.oauthAccessToken)}catch{return null}}};RA.FACEBOOK_SIGN_IN_METHOD="facebook.com";RA.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let bA=class ss extends ml{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return kh._fromParams({providerId:ss.PROVIDER_ID,signInMethod:ss.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return ss.credentialFromTaggedObject(e)}static credentialFromError(e){return ss.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return ss.credential(n,r)}catch{return null}}};bA.GOOGLE_SIGN_IN_METHOD="google.com";bA.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let NA=class os extends ml{constructor(){super("github.com")}static credential(e){return kh._fromParams({providerId:os.PROVIDER_ID,signInMethod:os.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return os.credentialFromTaggedObject(e)}static credentialFromError(e){return os.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return os.credential(e.oauthAccessToken)}catch{return null}}};NA.GITHUB_SIGN_IN_METHOD="github.com";NA.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let OA=class as extends ml{constructor(){super("twitter.com")}static credential(e,n){return kh._fromParams({providerId:as.PROVIDER_ID,signInMethod:as.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return as.credentialFromTaggedObject(e)}static credentialFromError(e){return as.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return as.credential(n,r)}catch{return null}}};OA.TWITTER_SIGN_IN_METHOD="twitter.com";OA.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Cg=class Rp{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await ws._fromIdTokenResponse(e,r,i),o=Lw(r);return new Rp({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=Lw(r);return new Rp({user:e,providerId:i,_tokenResponse:r,operationType:n})}};function Lw(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let c2=class bp extends rr{constructor(e,n,r,i){var s;super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,bp.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new bp(e,n,r,i)}};function DA(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?c2._fromErrorAndOperation(t,s,e,r):s})}async function h2(t,e,n=!1){const r=await Wa(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Cg._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function d2(t,e,n=!1){const{auth:r}=t;if(Bt(r.app))return Promise.reject(Fr(r));const i="reauthenticate";try{const s=await Wa(t,DA(r,i,e,t),n);K(s.idToken,r,"internal-error");const o=Tg(s.idToken);K(o,r,"internal-error");const{sub:l}=o;return K(t.uid===l,r,"user-mismatch"),Cg._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&cn(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xA(t,e,n=!1){if(Bt(t.app))return Promise.reject(Fr(t));const r="signIn",i=await DA(t,r,e),s=await Cg._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}async function f2(t,e){return xA(pl(t),e)}function p2(t,e){const n=Rh.parseLink(e);return(n==null?void 0:n.operation)==="EMAIL_SIGNIN"}async function m2(t,e,n){if(Bt(t.app))return Promise.reject(Fr(t));const r=Ie(t),i=uo.credentialWithLink(e,n||Sc());return K(i._tenantId===(r.tenantId||null),r,"tenant-id-mismatch"),f2(r,i)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function g2(t,e){return Ie(t).setPersistence(e)}function y2(t,e,n,r){return Ie(t).onIdTokenChanged(e,n,r)}function v2(t,e,n){return Ie(t).beforeAuthStateChanged(e,n)}const Pc="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let MA=class{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Pc,"1"),this.storage.removeItem(Pc),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _2=1e3,w2=10;let LA=class extends MA{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=TA(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,u)=>{this.notifyListeners(o,u)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);FM()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,w2):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},_2)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}};LA.type="LOCAL";const VA=LA;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let FA=class extends MA{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}};FA.type="SESSION";const UA=FA;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function E2(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let $A=class jA{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(i=>i.isListeningto(e));if(n)return n;const r=new jA(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:i,data:s}=n.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const l=Array.from(o).map(async c=>c(n.origin,s)),u=await E2(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};$A.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pg(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let I2=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((l,u)=>{const c=Pg("",20);i.port1.start();const d=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(p){const m=p;if(m.data.eventId===c)switch(m.data.status){case"ack":clearTimeout(d),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(m.data.response);break;default:clearTimeout(d),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sn(){return window}function T2(t){Sn().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BA(){return typeof Sn().WorkerGlobalScope<"u"&&typeof Sn().importScripts=="function"}async function S2(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function A2(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function C2(){return BA()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zA="firebaseLocalStorageDb",P2=1,kc="firebaseLocalStorage",HA="fbase_key";let gl=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function bh(t,e){return t.transaction([kc],e?"readwrite":"readonly").objectStore(kc)}function k2(){const t=indexedDB.deleteDatabase(zA);return new gl(t).toPromise()}function Np(){const t=indexedDB.open(zA,P2);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(kc,{keyPath:HA})}catch(i){n(i)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(kc)?e(r):(r.close(),await k2(),e(await Np()))})})}async function Vw(t,e,n){const r=bh(t,!0).put({[HA]:e,value:n});return new gl(r).toPromise()}async function R2(t,e){const n=bh(t,!1).get(e),r=await new gl(n).toPromise();return r===void 0?null:r.value}function Fw(t,e){const n=bh(t,!0).delete(e);return new gl(n).toPromise()}const b2=800,N2=3;let WA=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Np(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>N2)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return BA()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=$A._getInstance(C2()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await S2(),!this.activeServiceWorker)return;this.sender=new I2(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||A2()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Np();return await Vw(e,Pc,"1"),await Fw(e,Pc),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>Vw(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>R2(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>Fw(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=bh(i,!1).getAll();return new gl(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),n.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),n.push(i));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),b2)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};WA.type="LOCAL";const O2=WA;new fl(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function D2(t,e){return e?Un(e):(K(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let kg=class extends Ag{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Rs(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Rs(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Rs(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}};function x2(t){return xA(t.auth,new kg(t),t.bypassAuthState)}function M2(t){const{auth:e,user:n}=t;return K(n,e,"internal-error"),d2(n,new kg(t),t.bypassAuthState)}async function L2(t){const{auth:e,user:n}=t;return K(n,e,"internal-error"),h2(n,new kg(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qA=class{constructor(e,n,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:i,tenantId:s,error:o,type:l}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:n,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return x2;case"linkViaPopup":case"linkViaRedirect":return L2;case"reauthViaPopup":case"reauthViaRedirect":return M2;default:cn(this.auth,"internal-error")}}resolve(e){Xn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Xn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V2=new fl(2e3,1e4);let F2=class Jo extends qA{constructor(e,n,r,i,s){super(e,n,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Jo.currentPopupAction&&Jo.currentPopupAction.cancel(),Jo.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return K(e,this.auth,"internal-error"),e}async onExecution(){Xn(this.filter.length===1,"Popup operations only handle one event");const e=Pg();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Tn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Tn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Jo.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Tn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,V2.get())};e()}};F2.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U2="pendingRedirect",Du=new Map;let $2=class extends qA{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=Du.get(this.auth._key());if(!e){try{const r=await j2(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}Du.set(this.auth._key(),e)}return this.bypassAuthState||Du.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function j2(t,e){const n=H2(e),r=z2(t);if(!await r._isAvailable())return!1;const i=await r._get(n)==="true";return await r._remove(n),i}function B2(t,e){Du.set(t._key(),e)}function z2(t){return Un(t._redirectPersistence)}function H2(t){return Nu(U2,t.config.apiKey,t.name)}async function W2(t,e,n=!1){if(Bt(t.app))return Promise.reject(Fr(t));const r=pl(t),i=D2(r,e),o=await new $2(r,i,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q2=10*60*1e3;let G2=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!K2(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!GA(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(Tn(this.auth,i))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=q2&&this.cachedEventUids.clear(),this.cachedEventUids.has(Uw(e))}saveEventToCache(e){this.cachedEventUids.add(Uw(e)),this.lastProcessedEventTime=Date.now()}};function Uw(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function GA({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function K2(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return GA(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Q2(t,e={}){return ti(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Y2=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,J2=/^https?/;async function X2(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Q2(t);for(const n of e)try{if(Z2(n))return}catch{}cn(t,"unauthorized-domain")}function Z2(t){const e=Sc(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!J2.test(n))return!1;if(Y2.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eL=new fl(3e4,6e4);function $w(){const t=Sn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function tL(t){return new Promise((e,n)=>{var r,i,s;function o(){$w(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{$w(),n(Tn(t,"network-request-failed"))},timeout:eL.get()})}if(!((i=(r=Sn().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=Sn().gapi)===null||s===void 0)&&s.load)o();else{const l=GM("iframefcb");return Sn()[l]=()=>{gapi.load?o():n(Tn(t,"network-request-failed"))},AA(`${qM()}?onload=${l}`).catch(u=>n(u))}}).catch(e=>{throw xu=null,e})}let xu=null;function nL(t){return xu=xu||tL(t),xu}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rL=new fl(5e3,15e3),iL="__/auth/iframe",sL="emulator/auth/iframe",oL={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},aL=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function lL(t){const e=t.config;K(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Ig(e,sL):`https://${t.config.authDomain}/${iL}`,r={apiKey:e.apiKey,appName:t.name,v:no},i=aL.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${sl(r).slice(1)}`}async function uL(t){const e=await nL(t),n=Sn().gapi;return K(n,t,"internal-error"),e.open({where:document.body,url:lL(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:oL,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=Tn(t,"network-request-failed"),l=Sn().setTimeout(()=>{s(o)},rL.get());function u(){Sn().clearTimeout(l),i(r)}r.ping(u).then(u,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cL={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},hL=500,dL=600,fL="_blank",pL="http://localhost";let jw=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function mL(t,e,n,r=hL,i=dL){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const u=Object.assign(Object.assign({},cL),{width:r.toString(),height:i.toString(),top:s,left:o}),c=ut().toLowerCase();n&&(l=vA(c)?fL:n),gA(c)&&(e=e||pL,u.scrollbars="yes");const d=Object.entries(u).reduce((m,[w,C])=>`${m}${w}=${C},`,"");if(VM(c)&&l!=="_self")return gL(e||"",l),new jw(null);const p=window.open(e||"",l,d);K(p,t,"popup-blocked");try{p.focus()}catch{}return new jw(p)}function gL(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yL="__/auth/handler",vL="emulator/auth/handler",_L=encodeURIComponent("fac");async function Bw(t,e,n,r,i,s){K(t.config.authDomain,t,"auth-domain-config-required"),K(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:no,eventId:i};if(e instanceof kA){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Kb(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries({}))o[d]=p}if(e instanceof ml){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(o.scopes=d.join(","))}t.tenantId&&(o.tid=t.tenantId);const l=o;for(const d of Object.keys(l))l[d]===void 0&&delete l[d];const u=await t._getAppCheckToken(),c=u?`#${_L}=${encodeURIComponent(u)}`:"";return`${wL(t)}?${sl(l).slice(1)}${c}`}function wL({config:t}){return t.emulator?Ig(t,vL):`https://${t.authDomain}/${yL}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gd="webStorageSupport";let EL=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=UA,this._completeRedirectFn=W2,this._overrideRedirectResult=B2}async _openPopup(e,n,r,i){var s;Xn((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const o=await Bw(e,n,r,Sc(),i);return mL(e,o,Pg())}async _openRedirect(e,n,r,i){await this._originValidation(e);const s=await Bw(e,n,r,Sc(),i);return T2(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:i,promise:s}=this.eventManagers[n];return i?Promise.resolve(i):(Xn(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await uL(e),r=new G2(e);return n.register("authEvent",i=>(K(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(Gd,{type:Gd},i=>{var s;const o=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[Gd];o!==void 0&&n(!!o),cn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=X2(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return TA()||yA()||Sg()}};const IL=EL;var zw="@firebase/auth",Hw="1.10.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let TL=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){K(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SL(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function AL(t){ln(new Kt("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;K(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:SA(t)},c=new zM(r,i,s,u);return ZM(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),ln(new Kt("auth-internal",e=>{const n=pl(e.getProvider("auth").getImmediate());return(r=>new TL(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Ct(zw,Hw,SL(t)),Ct(zw,Hw,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CL=5*60,PL=v0("authIdTokenMaxAge")||CL;let Ww=null;const kL=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>PL)return;const i=n==null?void 0:n.token;Ww!==i&&(Ww=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function Rg(t=oh()){const e=Bi(t,"auth");if(e.isInitialized())return e.getImmediate();const n=XM(t,{popupRedirectResolver:IL,persistence:[O2,VA,UA]}),r=v0("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=kL(s.toString());v2(n,o,()=>o(n.currentUser)),y2(n,l=>o(l))}}const i=m0("auth");return i&&e2(n,`http://${i}`),n}function RL(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}HM({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=Tn("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",RL().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});AL("Browser");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bL="type.googleapis.com/google.protobuf.Int64Value",NL="type.googleapis.com/google.protobuf.UInt64Value";function KA(t,e){const n={};for(const r in t)t.hasOwnProperty(r)&&(n[r]=e(t[r]));return n}function Rc(t){if(t==null)return null;if(t instanceof Number&&(t=t.valueOf()),typeof t=="number"&&isFinite(t)||t===!0||t===!1||Object.prototype.toString.call(t)==="[object String]")return t;if(t instanceof Date)return t.toISOString();if(Array.isArray(t))return t.map(e=>Rc(e));if(typeof t=="function"||typeof t=="object")return KA(t,e=>Rc(e));throw new Error("Data cannot be encoded in JSON: "+t)}function Ks(t){if(t==null)return t;if(t["@type"])switch(t["@type"]){case bL:case NL:{const e=Number(t.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+t);return e}default:throw new Error("Data cannot be decoded from JSON: "+t)}return Array.isArray(t)?t.map(e=>Ks(e)):typeof t=="function"||typeof t=="object"?KA(t,e=>Ks(e)):t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bg="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qw={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class It extends rr{constructor(e,n,r){super(`${bg}/${e}`,n||""),this.details=r,Object.setPrototypeOf(this,It.prototype)}}function OL(t){if(t>=200&&t<300)return"ok";switch(t){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function bc(t,e){let n=OL(t),r=n,i;try{const s=e&&e.error;if(s){const o=s.status;if(typeof o=="string"){if(!qw[o])return new It("internal","internal");n=qw[o],r=o}const l=s.message;typeof l=="string"&&(r=l),i=s.details,i!==void 0&&(i=Ks(i))}}catch{}return n==="ok"?null:new It(n,r,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DL{constructor(e,n,r,i){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,Bt(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=n.getImmediate({optional:!0}),this.messaging=r.getImmediate({optional:!0}),this.auth||n.get().then(s=>this.auth=s,()=>{}),this.messaging||r.get().then(s=>this.messaging=s,()=>{}),this.appCheck||i==null||i.get().then(s=>this.appCheck=s,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const n=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return n.error?null:n.token}return null}async getContext(e){const n=await this.getAuthToken(),r=await this.getMessagingToken(),i=await this.getAppCheckToken(e);return{authToken:n,messagingToken:r,appCheckToken:i}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Op="us-central1",xL=/^data: (.*?)(?:\n|$)/;function ML(t){let e=null;return{promise:new Promise((n,r)=>{e=setTimeout(()=>{r(new It("deadline-exceeded","deadline-exceeded"))},t)}),cancel:()=>{e&&clearTimeout(e)}}}class LL{constructor(e,n,r,i,s=Op,o=(...l)=>fetch(...l)){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new DL(e,n,r,i),this.cancelAllRequests=new Promise(l=>{this.deleteService=()=>Promise.resolve(l())});try{const l=new URL(s);this.customDomain=l.origin+(l.pathname==="/"?"":l.pathname),this.region=Op}catch{this.customDomain=null,this.region=s}}_delete(){return this.deleteService()}_url(e){const n=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${n}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${n}.cloudfunctions.net/${e}`}}function VL(t,e,n){const r=$i(e);t.emulatorOrigin=`http${r?"s":""}://${e}:${n}`,r&&(xm(t.emulatorOrigin),Mm("Functions",!0))}function FL(t,e,n){const r=i=>$L(t,e,i,{});return r.stream=(i,s)=>BL(t,e,i,s),r}async function UL(t,e,n,r){n["Content-Type"]="application/json";let i;try{i=await r(t,{method:"POST",body:JSON.stringify(e),headers:n})}catch{return{status:0,json:null}}let s=null;try{s=await i.json()}catch{}return{status:i.status,json:s}}async function QA(t,e){const n={},r=await t.contextProvider.getContext(e.limitedUseAppCheckTokens);return r.authToken&&(n.Authorization="Bearer "+r.authToken),r.messagingToken&&(n["Firebase-Instance-ID-Token"]=r.messagingToken),r.appCheckToken!==null&&(n["X-Firebase-AppCheck"]=r.appCheckToken),n}function $L(t,e,n,r){const i=t._url(e);return jL(t,i,n,r)}async function jL(t,e,n,r){n=Rc(n);const i={data:n},s=await QA(t,r),o=r.timeout||7e4,l=ML(o),u=await Promise.race([UL(e,i,s,t.fetchImpl),l.promise,t.cancelAllRequests]);if(l.cancel(),!u)throw new It("cancelled","Firebase Functions instance was deleted.");const c=bc(u.status,u.json);if(c)throw c;if(!u.json)throw new It("internal","Response is not valid JSON object.");let d=u.json.data;if(typeof d>"u"&&(d=u.json.result),typeof d>"u")throw new It("internal","Response is missing data field.");return{data:Ks(d)}}function BL(t,e,n,r){const i=t._url(e);return zL(t,i,n,r||{})}async function zL(t,e,n,r){var i;n=Rc(n);const s={data:n},o=await QA(t,r);o["Content-Type"]="application/json",o.Accept="text/event-stream";let l;try{l=await t.fetchImpl(e,{method:"POST",body:JSON.stringify(s),headers:o,signal:r==null?void 0:r.signal})}catch(w){if(w instanceof Error&&w.name==="AbortError"){const P=new It("cancelled","Request was cancelled.");return{data:Promise.reject(P),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(P)}}}}}}const C=bc(0,null);return{data:Promise.reject(C),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(C)}}}}}}let u,c;const d=new Promise((w,C)=>{u=w,c=C});(i=r==null?void 0:r.signal)===null||i===void 0||i.addEventListener("abort",()=>{const w=new It("cancelled","Request was cancelled.");c(w)});const p=l.body.getReader(),m=HL(p,u,c,r==null?void 0:r.signal);return{stream:{[Symbol.asyncIterator](){const w=m.getReader();return{async next(){const{value:C,done:P}=await w.read();return{value:C,done:P}},async return(){return await w.cancel(),{done:!0,value:void 0}}}}},data:d}}function HL(t,e,n,r){const i=(o,l)=>{const u=o.match(xL);if(!u)return;const c=u[1];try{const d=JSON.parse(c);if("result"in d){e(Ks(d.result));return}if("message"in d){l.enqueue(Ks(d.message));return}if("error"in d){const p=bc(0,d);l.error(p),n(p);return}}catch(d){if(d instanceof It){l.error(d),n(d);return}}},s=new TextDecoder;return new ReadableStream({start(o){let l="";return u();async function u(){if(r!=null&&r.aborted){const c=new It("cancelled","Request was cancelled");return o.error(c),n(c),Promise.resolve()}try{const{value:c,done:d}=await t.read();if(d){l.trim()&&i(l.trim(),o),o.close();return}if(r!=null&&r.aborted){const m=new It("cancelled","Request was cancelled");o.error(m),n(m),await t.cancel();return}l+=s.decode(c,{stream:!0});const p=l.split(`
`);l=p.pop()||"";for(const m of p)m.trim()&&i(m.trim(),o);return u()}catch(c){const d=c instanceof It?c:bc(0,null);o.error(d),n(d)}}},cancel(){return t.cancel()}})}const Gw="@firebase/functions",Kw="0.12.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WL="auth-internal",qL="app-check-internal",GL="messaging-internal";function KL(t){const e=(n,{instanceIdentifier:r})=>{const i=n.getProvider("app").getImmediate(),s=n.getProvider(WL),o=n.getProvider(GL),l=n.getProvider(qL);return new LL(i,s,o,l,r)};ln(new Kt(bg,e,"PUBLIC").setMultipleInstances(!0)),Ct(Gw,Kw,t),Ct(Gw,Kw,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ng(t=oh(),e=Op){const r=Bi(Ie(t),bg).getImmediate({identifier:e}),i=g0("functions");return i&&QL(r,...i),r}function QL(t,e,n){VL(Ie(t),e,n)}function Nh(t,e,n){return FL(Ie(t),e)}KL();const YA="@firebase/installations",Og="0.6.18";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JA=1e4,XA=`w:${Og}`,ZA="FIS_v2",YL="https://firebaseinstallations.googleapis.com/v1",JL=60*60*1e3,XL="installations",ZL="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eV={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},Di=new ji(XL,ZL,eV);function e1(t){return t instanceof rr&&t.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function t1({projectId:t}){return`${YL}/projects/${t}/installations`}function n1(t){return{token:t.token,requestStatus:2,expiresIn:nV(t.expiresIn),creationTime:Date.now()}}async function r1(t,e){const r=(await e.json()).error;return Di.create("request-failed",{requestName:t,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function i1({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function tV(t,{refreshToken:e}){const n=i1(t);return n.append("Authorization",rV(e)),n}async function s1(t){const e=await t();return e.status>=500&&e.status<600?t():e}function nV(t){return Number(t.replace("s","000"))}function rV(t){return`${ZA} ${t}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function iV({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const r=t1(t),i=i1(t),s=e.getImmediate({optional:!0});if(s){const c=await s.getHeartbeatsHeader();c&&i.append("x-firebase-client",c)}const o={fid:n,authVersion:ZA,appId:t.appId,sdkVersion:XA},l={method:"POST",headers:i,body:JSON.stringify(o)},u=await s1(()=>fetch(r,l));if(u.ok){const c=await u.json();return{fid:c.fid||n,registrationStatus:2,refreshToken:c.refreshToken,authToken:n1(c.authToken)}}else throw await r1("Create Installation",u)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function o1(t){return new Promise(e=>{setTimeout(e,t)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sV(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oV=/^[cdef][\w-]{21}$/,Dp="";function aV(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const n=lV(t);return oV.test(n)?n:Dp}catch{return Dp}}function lV(t){return sV(t).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oh(t){return`${t.appName}!${t.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const a1=new Map;function l1(t,e){const n=Oh(t);u1(n,e),uV(n,e)}function u1(t,e){const n=a1.get(t);if(n)for(const r of n)r(e)}function uV(t,e){const n=cV();n&&n.postMessage({key:t,fid:e}),hV()}let vi=null;function cV(){return!vi&&"BroadcastChannel"in self&&(vi=new BroadcastChannel("[Firebase] FID Change"),vi.onmessage=t=>{u1(t.data.key,t.data.fid)}),vi}function hV(){a1.size===0&&vi&&(vi.close(),vi=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dV="firebase-installations-database",fV=1,xi="firebase-installations-store";let Kd=null;function Dg(){return Kd||(Kd=ol(dV,fV,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(xi)}}})),Kd}async function Nc(t,e){const n=Oh(t),i=(await Dg()).transaction(xi,"readwrite"),s=i.objectStore(xi),o=await s.get(n);return await s.put(e,n),await i.done,(!o||o.fid!==e.fid)&&l1(t,e.fid),e}async function c1(t){const e=Oh(t),r=(await Dg()).transaction(xi,"readwrite");await r.objectStore(xi).delete(e),await r.done}async function Dh(t,e){const n=Oh(t),i=(await Dg()).transaction(xi,"readwrite"),s=i.objectStore(xi),o=await s.get(n),l=e(o);return l===void 0?await s.delete(n):await s.put(l,n),await i.done,l&&(!o||o.fid!==l.fid)&&l1(t,l.fid),l}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xg(t){let e;const n=await Dh(t.appConfig,r=>{const i=pV(r),s=mV(t,i);return e=s.registrationPromise,s.installationEntry});return n.fid===Dp?{installationEntry:await e}:{installationEntry:n,registrationPromise:e}}function pV(t){const e=t||{fid:aV(),registrationStatus:0};return h1(e)}function mV(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const i=Promise.reject(Di.create("app-offline"));return{installationEntry:e,registrationPromise:i}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=gV(t,n);return{installationEntry:n,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:yV(t)}:{installationEntry:e}}async function gV(t,e){try{const n=await iV(t,e);return Nc(t.appConfig,n)}catch(n){throw e1(n)&&n.customData.serverCode===409?await c1(t.appConfig):await Nc(t.appConfig,{fid:e.fid,registrationStatus:0}),n}}async function yV(t){let e=await Qw(t.appConfig);for(;e.registrationStatus===1;)await o1(100),e=await Qw(t.appConfig);if(e.registrationStatus===0){const{installationEntry:n,registrationPromise:r}=await xg(t);return r||n}return e}function Qw(t){return Dh(t,e=>{if(!e)throw Di.create("installation-not-found");return h1(e)})}function h1(t){return vV(t)?{fid:t.fid,registrationStatus:0}:t}function vV(t){return t.registrationStatus===1&&t.registrationTime+JA<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _V({appConfig:t,heartbeatServiceProvider:e},n){const r=wV(t,n),i=tV(t,n),s=e.getImmediate({optional:!0});if(s){const c=await s.getHeartbeatsHeader();c&&i.append("x-firebase-client",c)}const o={installation:{sdkVersion:XA,appId:t.appId}},l={method:"POST",headers:i,body:JSON.stringify(o)},u=await s1(()=>fetch(r,l));if(u.ok){const c=await u.json();return n1(c)}else throw await r1("Generate Auth Token",u)}function wV(t,{fid:e}){return`${t1(t)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mg(t,e=!1){let n;const r=await Dh(t.appConfig,s=>{if(!d1(s))throw Di.create("not-registered");const o=s.authToken;if(!e&&TV(o))return s;if(o.requestStatus===1)return n=EV(t,e),s;{if(!navigator.onLine)throw Di.create("app-offline");const l=AV(s);return n=IV(t,l),l}});return n?await n:r.authToken}async function EV(t,e){let n=await Yw(t.appConfig);for(;n.authToken.requestStatus===1;)await o1(100),n=await Yw(t.appConfig);const r=n.authToken;return r.requestStatus===0?Mg(t,e):r}function Yw(t){return Dh(t,e=>{if(!d1(e))throw Di.create("not-registered");const n=e.authToken;return CV(n)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function IV(t,e){try{const n=await _V(t,e),r=Object.assign(Object.assign({},e),{authToken:n});return await Nc(t.appConfig,r),n}catch(n){if(e1(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await c1(t.appConfig);else{const r=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await Nc(t.appConfig,r)}throw n}}function d1(t){return t!==void 0&&t.registrationStatus===2}function TV(t){return t.requestStatus===2&&!SV(t)}function SV(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+JL}function AV(t){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},t),{authToken:e})}function CV(t){return t.requestStatus===1&&t.requestTime+JA<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function PV(t){const e=t,{installationEntry:n,registrationPromise:r}=await xg(e);return r?r.catch(console.error):Mg(e).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kV(t,e=!1){const n=t;return await RV(n),(await Mg(n,e)).token}async function RV(t){const{registrationPromise:e}=await xg(t);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bV(t){if(!t||!t.options)throw Qd("App Configuration");if(!t.name)throw Qd("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw Qd(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function Qd(t){return Di.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f1="installations",NV="installations-internal",OV=t=>{const e=t.getProvider("app").getImmediate(),n=bV(e),r=Bi(e,"heartbeat");return{app:e,appConfig:n,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},DV=t=>{const e=t.getProvider("app").getImmediate(),n=Bi(e,f1).getImmediate();return{getId:()=>PV(n),getToken:i=>kV(n,i)}};function xV(){ln(new Kt(f1,OV,"PUBLIC")),ln(new Kt(NV,DV,"PRIVATE"))}xV();Ct(YA,Og);Ct(YA,Og,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const MV="/firebase-messaging-sw.js",LV="/firebase-cloud-messaging-push-scope",p1="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",VV="https://fcmregistrations.googleapis.com/v1",m1="google.c.a.c_id",FV="google.c.a.c_l",UV="google.c.a.ts",$V="google.c.a.e",Jw=1e4;var Xw;(function(t){t[t.DATA_MESSAGE=1]="DATA_MESSAGE",t[t.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(Xw||(Xw={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var Ga;(function(t){t.PUSH_RECEIVED="push-received",t.NOTIFICATION_CLICKED="notification-clicked"})(Ga||(Ga={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xn(t){const e=new Uint8Array(t);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function jV(t){const e="=".repeat((4-t.length%4)%4),n=(t+e).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(n),i=new Uint8Array(r.length);for(let s=0;s<r.length;++s)i[s]=r.charCodeAt(s);return i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yd="fcm_token_details_db",BV=5,Zw="fcm_token_object_Store";async function zV(t){if("databases"in indexedDB&&!(await indexedDB.databases()).map(s=>s.name).includes(Yd))return null;let e=null;return(await ol(Yd,BV,{upgrade:async(r,i,s,o)=>{var l;if(i<2||!r.objectStoreNames.contains(Zw))return;const u=o.objectStore(Zw),c=await u.index("fcmSenderId").get(t);if(await u.clear(),!!c){if(i===2){const d=c;if(!d.auth||!d.p256dh||!d.endpoint)return;e={token:d.fcmToken,createTime:(l=d.createTime)!==null&&l!==void 0?l:Date.now(),subscriptionOptions:{auth:d.auth,p256dh:d.p256dh,endpoint:d.endpoint,swScope:d.swScope,vapidKey:typeof d.vapidKey=="string"?d.vapidKey:xn(d.vapidKey)}}}else if(i===3){const d=c;e={token:d.fcmToken,createTime:d.createTime,subscriptionOptions:{auth:xn(d.auth),p256dh:xn(d.p256dh),endpoint:d.endpoint,swScope:d.swScope,vapidKey:xn(d.vapidKey)}}}else if(i===4){const d=c;e={token:d.fcmToken,createTime:d.createTime,subscriptionOptions:{auth:xn(d.auth),p256dh:xn(d.p256dh),endpoint:d.endpoint,swScope:d.swScope,vapidKey:xn(d.vapidKey)}}}}}})).close(),await Ld(Yd),await Ld("fcm_vapid_details_db"),await Ld("undefined"),HV(e)?e:null}function HV(t){if(!t||!t.subscriptionOptions)return!1;const{subscriptionOptions:e}=t;return typeof t.createTime=="number"&&t.createTime>0&&typeof t.token=="string"&&t.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WV="firebase-messaging-database",qV=1,Ka="firebase-messaging-store";let Jd=null;function g1(){return Jd||(Jd=ol(WV,qV,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(Ka)}}})),Jd}async function GV(t){const e=y1(t),r=await(await g1()).transaction(Ka).objectStore(Ka).get(e);if(r)return r;{const i=await zV(t.appConfig.senderId);if(i)return await Lg(t,i),i}}async function Lg(t,e){const n=y1(t),i=(await g1()).transaction(Ka,"readwrite");return await i.objectStore(Ka).put(e,n),await i.done,e}function y1({appConfig:t}){return t.appId}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KV={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},at=new ji("messaging","Messaging",KV);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function QV(t,e){const n=await Fg(t),r=v1(e),i={method:"POST",headers:n,body:JSON.stringify(r)};let s;try{s=await(await fetch(Vg(t.appConfig),i)).json()}catch(o){throw at.create("token-subscribe-failed",{errorInfo:o==null?void 0:o.toString()})}if(s.error){const o=s.error.message;throw at.create("token-subscribe-failed",{errorInfo:o})}if(!s.token)throw at.create("token-subscribe-no-token");return s.token}async function YV(t,e){const n=await Fg(t),r=v1(e.subscriptionOptions),i={method:"PATCH",headers:n,body:JSON.stringify(r)};let s;try{s=await(await fetch(`${Vg(t.appConfig)}/${e.token}`,i)).json()}catch(o){throw at.create("token-update-failed",{errorInfo:o==null?void 0:o.toString()})}if(s.error){const o=s.error.message;throw at.create("token-update-failed",{errorInfo:o})}if(!s.token)throw at.create("token-update-no-token");return s.token}async function JV(t,e){const r={method:"DELETE",headers:await Fg(t)};try{const s=await(await fetch(`${Vg(t.appConfig)}/${e}`,r)).json();if(s.error){const o=s.error.message;throw at.create("token-unsubscribe-failed",{errorInfo:o})}}catch(i){throw at.create("token-unsubscribe-failed",{errorInfo:i==null?void 0:i.toString()})}}function Vg({projectId:t}){return`${VV}/projects/${t}/registrations`}async function Fg({appConfig:t,installations:e}){const n=await e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t.apiKey,"x-goog-firebase-installations-auth":`FIS ${n}`})}function v1({p256dh:t,auth:e,endpoint:n,vapidKey:r}){const i={web:{endpoint:n,auth:e,p256dh:t}};return r!==p1&&(i.web.applicationPubKey=r),i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const XV=7*24*60*60*1e3;async function ZV(t){const e=await tF(t.swRegistration,t.vapidKey),n={vapidKey:t.vapidKey,swScope:t.swRegistration.scope,endpoint:e.endpoint,auth:xn(e.getKey("auth")),p256dh:xn(e.getKey("p256dh"))},r=await GV(t.firebaseDependencies);if(r){if(nF(r.subscriptionOptions,n))return Date.now()>=r.createTime+XV?eF(t,{token:r.token,createTime:Date.now(),subscriptionOptions:n}):r.token;try{await JV(t.firebaseDependencies,r.token)}catch(i){console.warn(i)}return eE(t.firebaseDependencies,n)}else return eE(t.firebaseDependencies,n)}async function eF(t,e){try{const n=await YV(t.firebaseDependencies,e),r=Object.assign(Object.assign({},e),{token:n,createTime:Date.now()});return await Lg(t.firebaseDependencies,r),n}catch(n){throw n}}async function eE(t,e){const r={token:await QV(t,e),createTime:Date.now(),subscriptionOptions:e};return await Lg(t,r),r.token}async function tF(t,e){const n=await t.pushManager.getSubscription();return n||t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:jV(e)})}function nF(t,e){const n=e.vapidKey===t.vapidKey,r=e.endpoint===t.endpoint,i=e.auth===t.auth,s=e.p256dh===t.p256dh;return n&&r&&i&&s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tE(t){const e={from:t.from,collapseKey:t.collapse_key,messageId:t.fcmMessageId};return rF(e,t),iF(e,t),sF(e,t),e}function rF(t,e){if(!e.notification)return;t.notification={};const n=e.notification.title;n&&(t.notification.title=n);const r=e.notification.body;r&&(t.notification.body=r);const i=e.notification.image;i&&(t.notification.image=i);const s=e.notification.icon;s&&(t.notification.icon=s)}function iF(t,e){e.data&&(t.data=e.data)}function sF(t,e){var n,r,i,s,o;if(!e.fcmOptions&&!(!((n=e.notification)===null||n===void 0)&&n.click_action))return;t.fcmOptions={};const l=(i=(r=e.fcmOptions)===null||r===void 0?void 0:r.link)!==null&&i!==void 0?i:(s=e.notification)===null||s===void 0?void 0:s.click_action;l&&(t.fcmOptions.link=l);const u=(o=e.fcmOptions)===null||o===void 0?void 0:o.analytics_label;u&&(t.fcmOptions.analyticsLabel=u)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oF(t){return typeof t=="object"&&!!t&&m1 in t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aF(t){if(!t||!t.options)throw Xd("App Configuration Object");if(!t.name)throw Xd("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:n}=t;for(const r of e)if(!n[r])throw Xd(r);return{appName:t.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function Xd(t){return at.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let lF=class{constructor(e,n,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const i=aF(e);this.firebaseDependencies={app:e,appConfig:i,installations:n,analyticsProvider:r}}_delete(){return Promise.resolve()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function uF(t){try{t.swRegistration=await navigator.serviceWorker.register(MV,{scope:LV}),t.swRegistration.update().catch(()=>{}),await cF(t.swRegistration)}catch(e){throw at.create("failed-service-worker-registration",{browserErrorMessage:e==null?void 0:e.message})}}async function cF(t){return new Promise((e,n)=>{const r=setTimeout(()=>n(new Error(`Service worker not registered after ${Jw} ms`)),Jw),i=t.installing||t.waiting;t.active?(clearTimeout(r),e()):i?i.onstatechange=s=>{var o;((o=s.target)===null||o===void 0?void 0:o.state)==="activated"&&(i.onstatechange=null,clearTimeout(r),e())}:(clearTimeout(r),n(new Error("No incoming service worker found.")))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hF(t,e){if(!e&&!t.swRegistration&&await uF(t),!(!e&&t.swRegistration)){if(!(e instanceof ServiceWorkerRegistration))throw at.create("invalid-sw-registration");t.swRegistration=e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dF(t,e){e?t.vapidKey=e:t.vapidKey||(t.vapidKey=p1)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _1(t,e){if(!navigator)throw at.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw at.create("permission-blocked");return await dF(t,e==null?void 0:e.vapidKey),await hF(t,e==null?void 0:e.serviceWorkerRegistration),ZV(t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fF(t,e,n){const r=pF(e);(await t.firebaseDependencies.analyticsProvider.get()).logEvent(r,{message_id:n[m1],message_name:n[FV],message_time:n[UV],message_device_time:Math.floor(Date.now()/1e3)})}function pF(t){switch(t){case Ga.NOTIFICATION_CLICKED:return"notification_open";case Ga.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mF(t,e){const n=e.data;if(!n.isFirebaseMessaging)return;t.onMessageHandler&&n.messageType===Ga.PUSH_RECEIVED&&(typeof t.onMessageHandler=="function"?t.onMessageHandler(tE(n)):t.onMessageHandler.next(tE(n)));const r=n.data;oF(r)&&r[$V]==="1"&&await fF(t,n.messageType,r)}const nE="@firebase/messaging",rE="0.12.22";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gF=t=>{const e=new lF(t.getProvider("app").getImmediate(),t.getProvider("installations-internal").getImmediate(),t.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",n=>mF(e,n)),e},yF=t=>{const e=t.getProvider("messaging").getImmediate();return{getToken:r=>_1(e,r)}};function vF(){ln(new Kt("messaging",gF,"PUBLIC")),ln(new Kt("messaging-internal",yF,"PRIVATE")),Ct(nE,rE),Ct(nE,rE,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function w1(){try{await w0()}catch{return!1}return typeof window<"u"&&_0()&&Hb()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _F(t,e){if(!navigator)throw at.create("only-available-in-window");return t.onMessageHandler=e,()=>{t.onMessageHandler=null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function E1(t=oh()){return w1().then(e=>{if(!e)throw at.create("unsupported-browser")},e=>{throw at.create("indexed-db-unsupported")}),Bi(Ie(t),"messaging").getImmediate()}async function wF(t,e){return t=Ie(t),_1(t,e)}function EF(t,e){return t=Ie(t),_F(t,e)}vF();const IF={BASE_URL:"/",DEV:!1,MODE:"production",PROD:!0,SSR:!1,VITE_AUTH_EMAIL_LINK_URL:"https://bueno-brows-7cce7.web.app/verify",VITE_FIREBASE_API_KEY:"AIzaSyDMsLYmLj4qZR2Ty5sJJX9ZEZInc61dJos",VITE_FIREBASE_APP_ID:"1:494398949506:web:b4e591e20590044c72cc9b",VITE_FIREBASE_AUTH_DOMAIN:"bueno-brows-7cce7.firebaseapp.com",VITE_FIREBASE_FUNCTIONS_REGION:"us-central1",VITE_FIREBASE_MESSAGING_SENDER_ID:"494398949506",VITE_FIREBASE_PROJECT_ID:"bueno-brows-7cce7",VITE_FIREBASE_STORAGE_BUCKET:"bueno-brows-7cce7.firebasestorage.app",VITE_USE_EMULATORS:"0"};function Xi(t){const e=IF[t];if(!e){const n=t==="VITE_FIREBASE_API_KEY"?"***":"";throw console.error(`[Firebase] Missing env: ${t}${n?" ("+n+")":""}`),new Error(`Missing env ${t}`)}return e}let uu=null;function xh(){if(uu)return uu;const t={apiKey:Xi("VITE_FIREBASE_API_KEY"),authDomain:Xi("VITE_FIREBASE_AUTH_DOMAIN"),projectId:Xi("VITE_FIREBASE_PROJECT_ID"),storageBucket:Xi("VITE_FIREBASE_STORAGE_BUCKET"),messagingSenderId:Xi("VITE_FIREBASE_MESSAGING_SENDER_ID"),appId:Xi("VITE_FIREBASE_APP_ID")},e=QN(),n=e.length>0?e[0]:S0(t);console.log("[Firebase] App initialized:",n.name,n.options.projectId);const r=rM(n),i=Rg(n);console.log("[Firebase] Firestore and Auth initialized");const o=Ng(n,"us-central1");let l;return typeof window<"u"&&w1().then(u=>{u&&(l=E1(n))}),uu={app:n,db:r,auth:i,functions:o,messaging:l},uu}const I1=L.createContext(null);function TF({children:t}){const e=L.useMemo(()=>xh(),[]);return D.jsx(I1.Provider,{value:e,children:t})}function Ug(){const t=L.useContext(I1);if(!t)throw new Error("useFirebase must be used within FirebaseProvider");return t}function SF(){const t=({isActive:e})=>`px-3 py-2 rounded-md text-sm ${e?"bg-terracotta text-white":"hover:bg-white/50"}`;return D.jsx("header",{className:"bg-white/80 backdrop-blur border-b",children:D.jsxs("div",{className:"max-w-6xl mx-auto flex items-center justify-between p-4",children:[D.jsx(js,{to:"/",className:"font-serif text-2xl text-terracotta",children:"BUENO BROWS"}),D.jsxs("nav",{className:"flex items-center gap-2",children:[D.jsx(Od,{to:"/",className:t,end:!0,children:"Home"}),D.jsx(Od,{to:"/services",className:t,children:"Services"}),D.jsx(Od,{to:"/book",className:t,children:"Book"}),D.jsx("a",{href:"#reviews",className:"px-3 py-2 rounded-md text-sm hover:bg-white/50",children:"Reviews"})]})]})})}function AF(){return D.jsxs("section",{className:"grid md:grid-cols-2 gap-6 items-center",children:[D.jsxs("div",{children:[D.jsx("h1",{className:"font-serif text-4xl text-terracotta mb-3",children:"Refined. Natural. You."}),D.jsx("p",{className:"text-slate-600 mb-4",children:"Filipino-inspired beauty studio specializing in brows & lashes. Thoughtfully scheduled, never rushed."}),D.jsxs("div",{className:"flex gap-3",children:[D.jsx(js,{to:"/book",className:"bg-terracotta text-white rounded-md px-4 py-2",children:"Book now"}),D.jsx(js,{to:"/services",className:"border rounded-md px-4 py-2",children:"See services"})]})]}),D.jsxs("div",{className:"relative bg-white rounded-2xl shadow-soft h-64 grid place-items-center overflow-hidden",children:[D.jsx("span",{className:"text-slate-400",children:"Hero image / floral frame (TBD)"}),D.jsxs("div",{className:"pointer-events-none absolute inset-0",children:[D.jsx("div",{className:"absolute -top-3 -left-3 w-24 h-24 rounded-full bg-terracotta/5"}),D.jsx("div",{className:"absolute -bottom-4 -right-4 w-28 h-28 rounded-full bg-gold/10"})]})]}),D.jsxs("div",{id:"reviews",className:"md:col-span-2 mt-8",children:[D.jsx("h2",{className:"font-serif text-2xl mb-2",children:"What clients say"}),D.jsx("div",{className:"grid sm:grid-cols-2 lg:grid-cols-3 gap-4",children:[1,2,3].map(t=>D.jsxs("div",{className:"bg-white rounded-xl shadow-soft p-4 text-sm text-slate-700",children:[D.jsx("p",{children:"“Beautiful, natural results. Booking was easy and I felt cared for.”"}),D.jsx("div",{className:"mt-2 text-xs text-slate-500",children:"— Happy client"})]},t))})]})]})}function T1(t,e,n){const r=Rt(t,"services"),i=e!=null&&e.activeOnly?mn(r,Ut("active","==",!0),yi("name","asc")):mn(r,yi("name","asc"));return Ha(i,s=>{const o=s.docs.map(l=>({id:l.id,...l.data()}));n(o)})}async function iE(t,e){const n=e.id?Gs(t,"customers",e.id):Gs(Rt(t,"customers"));return await mM(n,{name:e.name||"Unnamed",email:e.email||null,phone:e.phone||null,notes:e.notes||null,status:e.status||"approved",createdAt:Dn(),updatedAt:Dn()},{merge:!0}),n.id}async function sE(t,e){const n=mn(Rt(t,"customers"),Ut("email","==",e),sA(1)),r=await Qo(n);if(r.empty)return null;const i=r.docs[0];return{id:i.id,...i.data()}}function CF(t,e,n){const r=new Date(e);r.setHours(0,0,0,0);const i=new Date(e);i.setHours(23,59,59,999);const s=mn(Rt(t,"appointments"),Ut("start",">=",r.toISOString()),Ut("start","<=",i.toISOString()),yi("start","asc"));return Ha(s,o=>{const l=[];o.forEach(u=>{const c={id:u.id,...u.data()};c.status!=="cancelled"&&l.push(c)}),n(l)})}function PF(t,e){const n=Gs(t,"settings","businessHours");return Ha(n,r=>e(r.data()))}function kF(){const{db:t}=Ug(),[e,n]=L.useState([]),[r,i]=L.useState(""),[s,o]=L.useState("All");L.useEffect(()=>T1(t,{activeOnly:!0},n),[]);const l=L.useMemo(()=>{const c=new Set;return e.forEach(d=>d.category&&c.add(d.category)),["All",...Array.from(c).sort()]},[e]),u=L.useMemo(()=>{const c=r.trim().toLowerCase();return e.filter(d=>{const p=s==="All"||d.category===s,m=!c||d.name.toLowerCase().includes(c)||(d.description||"").toLowerCase().includes(c);return p&&m})},[e,r,s]);return D.jsxs("section",{className:"grid gap-4",children:[D.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3",children:[D.jsxs("div",{children:[D.jsx("h2",{className:"font-serif text-2xl",children:"Services"}),D.jsx("p",{className:"text-slate-600 text-sm",children:"Explore our offerings. Prices reflect current rates; your booked price is saved at confirmation."})]}),D.jsxs("div",{className:"flex flex-wrap gap-2",children:[D.jsx("input",{className:"border rounded-md p-2 min-w-[200px]",placeholder:"Search services…",value:r,onChange:c=>i(c.target.value),"aria-label":"Search services"}),D.jsx("select",{className:"border rounded-md p-2",value:s,onChange:c=>o(c.target.value),"aria-label":"Filter by category",children:l.map(c=>D.jsx("option",{value:c,children:c},c))})]})]}),D.jsxs("div",{className:"grid sm:grid-cols-2 lg:grid-cols-3 gap-4",children:[u.map(c=>D.jsxs("article",{className:"bg-white rounded-xl shadow-soft p-4 flex flex-col",children:[D.jsxs("header",{className:"mb-2",children:[D.jsx("div",{className:"text-sm text-slate-500",children:c.category||"Service"}),D.jsx("h3",{className:"font-medium text-lg",children:c.name})]}),D.jsx("p",{className:"text-sm text-slate-600 min-h-[2.5rem]",children:c.description||"Beautiful brows, tailored to you."}),D.jsxs("div",{className:"mt-3 text-sm text-slate-700",children:["Duration: ",c.duration," min"]}),D.jsxs("div",{className:"mt-1 text-terracotta font-semibold",children:["$",c.price.toFixed(2)]}),D.jsx("div",{className:"mt-auto pt-3",children:D.jsx(js,{to:"/book",className:"inline-block bg-terracotta text-white rounded-md px-3 py-2",children:"Book this"})})]},c.id)),!u.length&&D.jsx("div",{className:"text-slate-500 text-sm",children:"No services match your search. Try clearing filters."})]})]})}function RF(t,e,n,r){const i=n.timezone||"America/Los_Angeles",s=["sun","mon","tue","wed","thu","fri","sat"][t.getDay()],o=n.slots[s]||[],l=Math.max(5,n.slotInterval||15),u=[];for(const[c,d]of o){const p=oE(t,c,i),m=oE(t,d,i);for(let w=p.getTime();w+e*6e4<=m.getTime();w+=l*6e4){const C=new Date(w).toISOString(),P=w+e*6e4;bF(w,P,r)||u.push(C)}}return u}function bF(t,e,n){for(const r of n){if(r.status==="cancelled")continue;const i=new Date(r.start).getTime(),s=i+r.duration*6e4;if(i<e&&s>t)return!0}return!1}function oE(t,e,n){const[r,i]=e.split(":").map(l=>parseInt(l,10)),s=new Intl.DateTimeFormat("en-US",{timeZone:n,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).formatToParts(new Date(t.getFullYear(),t.getMonth(),t.getDate(),r,i,0)),o=l=>{var u;return Number(((u=s.find(c=>c.type===l))==null?void 0:u.value)||"0")};return new Date(o("year"),o("month")-1,o("day"),o("hour"),o("minute"),o("second"))}function $g(){const{app:t}=xh();return Ng(t,"us-central1")}function jg(t){return((t==null?void 0:t.message)||"").includes("E_OVERLAP")||(t==null?void 0:t.details)==="E_OVERLAP"?new Error("E_OVERLAP"):new Error((t==null?void 0:t.message)||"Function call failed")}async function NF(t){try{return(await Nh($g(),"createSlotHold")(t)).data}catch(e){throw jg(e)}}async function OF(t){try{return(await Nh($g(),"finalizeBookingFromHold")(t)).data}catch(e){throw jg(e)}}async function aE(t){try{return(await Nh($g(),"releaseHold")({holdId:t})).data}catch(e){throw jg(e)}}function DF(t="bb_session"){if(typeof window>"u")return lE();const e=window.sessionStorage.getItem(t);if(e)return e;const n=lE();return window.sessionStorage.setItem(t,n),n}function lE(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)}function hn(t){const e=Object.prototype.toString.call(t);return t instanceof Date||typeof t=="object"&&e==="[object Date]"?new t.constructor(+t):typeof t=="number"||e==="[object Number]"||typeof t=="string"||e==="[object String]"?new Date(t):new Date(NaN)}function Mi(t,e){return t instanceof Date?new t.constructor(e):new Date(e)}const S1=6048e5,xF=864e5,A1=6e4,C1=36e5;let MF={};function Mh(){return MF}function Qa(t,e){var l,u,c,d;const n=Mh(),r=(e==null?void 0:e.weekStartsOn)??((u=(l=e==null?void 0:e.locale)==null?void 0:l.options)==null?void 0:u.weekStartsOn)??n.weekStartsOn??((d=(c=n.locale)==null?void 0:c.options)==null?void 0:d.weekStartsOn)??0,i=hn(t),s=i.getDay(),o=(s<r?7:0)+s-r;return i.setDate(i.getDate()-o),i.setHours(0,0,0,0),i}function Oc(t){return Qa(t,{weekStartsOn:1})}function P1(t){const e=hn(t),n=e.getFullYear(),r=Mi(t,0);r.setFullYear(n+1,0,4),r.setHours(0,0,0,0);const i=Oc(r),s=Mi(t,0);s.setFullYear(n,0,4),s.setHours(0,0,0,0);const o=Oc(s);return e.getTime()>=i.getTime()?n+1:e.getTime()>=o.getTime()?n:n-1}function uE(t){const e=hn(t);return e.setHours(0,0,0,0),e}function cE(t){const e=hn(t),n=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()));return n.setUTCFullYear(e.getFullYear()),+t-+n}function LF(t,e){const n=uE(t),r=uE(e),i=+n-cE(n),s=+r-cE(r);return Math.round((i-s)/xF)}function VF(t){const e=P1(t),n=Mi(t,0);return n.setFullYear(e,0,4),n.setHours(0,0,0,0),Oc(n)}function FF(t){return t instanceof Date||typeof t=="object"&&Object.prototype.toString.call(t)==="[object Date]"}function UF(t){if(!FF(t)&&typeof t!="number")return!1;const e=hn(t);return!isNaN(Number(e))}function $F(t){const e=hn(t),n=Mi(t,0);return n.setFullYear(e.getFullYear(),0,1),n.setHours(0,0,0,0),n}const jF={lessThanXSeconds:{one:"less than a second",other:"less than {{count}} seconds"},xSeconds:{one:"1 second",other:"{{count}} seconds"},halfAMinute:"half a minute",lessThanXMinutes:{one:"less than a minute",other:"less than {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"about 1 hour",other:"about {{count}} hours"},xHours:{one:"1 hour",other:"{{count}} hours"},xDays:{one:"1 day",other:"{{count}} days"},aboutXWeeks:{one:"about 1 week",other:"about {{count}} weeks"},xWeeks:{one:"1 week",other:"{{count}} weeks"},aboutXMonths:{one:"about 1 month",other:"about {{count}} months"},xMonths:{one:"1 month",other:"{{count}} months"},aboutXYears:{one:"about 1 year",other:"about {{count}} years"},xYears:{one:"1 year",other:"{{count}} years"},overXYears:{one:"over 1 year",other:"over {{count}} years"},almostXYears:{one:"almost 1 year",other:"almost {{count}} years"}},BF=(t,e,n)=>{let r;const i=jF[t];return typeof i=="string"?r=i:e===1?r=i.one:r=i.other.replace("{{count}}",e.toString()),n!=null&&n.addSuffix?n.comparison&&n.comparison>0?"in "+r:r+" ago":r};function Zd(t){return(e={})=>{const n=e.width?String(e.width):t.defaultWidth;return t.formats[n]||t.formats[t.defaultWidth]}}const zF={full:"EEEE, MMMM do, y",long:"MMMM do, y",medium:"MMM d, y",short:"MM/dd/yyyy"},HF={full:"h:mm:ss a zzzz",long:"h:mm:ss a z",medium:"h:mm:ss a",short:"h:mm a"},WF={full:"{{date}} 'at' {{time}}",long:"{{date}} 'at' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},qF={date:Zd({formats:zF,defaultWidth:"full"}),time:Zd({formats:HF,defaultWidth:"full"}),dateTime:Zd({formats:WF,defaultWidth:"full"})},GF={lastWeek:"'last' eeee 'at' p",yesterday:"'yesterday at' p",today:"'today at' p",tomorrow:"'tomorrow at' p",nextWeek:"eeee 'at' p",other:"P"},KF=(t,e,n,r)=>GF[t];function Mo(t){return(e,n)=>{const r=n!=null&&n.context?String(n.context):"standalone";let i;if(r==="formatting"&&t.formattingValues){const o=t.defaultFormattingWidth||t.defaultWidth,l=n!=null&&n.width?String(n.width):o;i=t.formattingValues[l]||t.formattingValues[o]}else{const o=t.defaultWidth,l=n!=null&&n.width?String(n.width):t.defaultWidth;i=t.values[l]||t.values[o]}const s=t.argumentCallback?t.argumentCallback(e):e;return i[s]}}const QF={narrow:["B","A"],abbreviated:["BC","AD"],wide:["Before Christ","Anno Domini"]},YF={narrow:["1","2","3","4"],abbreviated:["Q1","Q2","Q3","Q4"],wide:["1st quarter","2nd quarter","3rd quarter","4th quarter"]},JF={narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],wide:["January","February","March","April","May","June","July","August","September","October","November","December"]},XF={narrow:["S","M","T","W","T","F","S"],short:["Su","Mo","Tu","We","Th","Fr","Sa"],abbreviated:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],wide:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},ZF={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"}},e4={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"}},t4=(t,e)=>{const n=Number(t),r=n%100;if(r>20||r<10)switch(r%10){case 1:return n+"st";case 2:return n+"nd";case 3:return n+"rd"}return n+"th"},n4={ordinalNumber:t4,era:Mo({values:QF,defaultWidth:"wide"}),quarter:Mo({values:YF,defaultWidth:"wide",argumentCallback:t=>t-1}),month:Mo({values:JF,defaultWidth:"wide"}),day:Mo({values:XF,defaultWidth:"wide"}),dayPeriod:Mo({values:ZF,defaultWidth:"wide",formattingValues:e4,defaultFormattingWidth:"wide"})};function Lo(t){return(e,n={})=>{const r=n.width,i=r&&t.matchPatterns[r]||t.matchPatterns[t.defaultMatchWidth],s=e.match(i);if(!s)return null;const o=s[0],l=r&&t.parsePatterns[r]||t.parsePatterns[t.defaultParseWidth],u=Array.isArray(l)?i4(l,p=>p.test(o)):r4(l,p=>p.test(o));let c;c=t.valueCallback?t.valueCallback(u):u,c=n.valueCallback?n.valueCallback(c):c;const d=e.slice(o.length);return{value:c,rest:d}}}function r4(t,e){for(const n in t)if(Object.prototype.hasOwnProperty.call(t,n)&&e(t[n]))return n}function i4(t,e){for(let n=0;n<t.length;n++)if(e(t[n]))return n}function s4(t){return(e,n={})=>{const r=e.match(t.matchPattern);if(!r)return null;const i=r[0],s=e.match(t.parsePattern);if(!s)return null;let o=t.valueCallback?t.valueCallback(s[0]):s[0];o=n.valueCallback?n.valueCallback(o):o;const l=e.slice(i.length);return{value:o,rest:l}}}const o4=/^(\d+)(th|st|nd|rd)?/i,a4=/\d+/i,l4={narrow:/^(b|a)/i,abbreviated:/^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,wide:/^(before christ|before common era|anno domini|common era)/i},u4={any:[/^b/i,/^(a|c)/i]},c4={narrow:/^[1234]/i,abbreviated:/^q[1234]/i,wide:/^[1234](th|st|nd|rd)? quarter/i},h4={any:[/1/i,/2/i,/3/i,/4/i]},d4={narrow:/^[jfmasond]/i,abbreviated:/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,wide:/^(january|february|march|april|may|june|july|august|september|october|november|december)/i},f4={narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^ap/i,/^may/i,/^jun/i,/^jul/i,/^au/i,/^s/i,/^o/i,/^n/i,/^d/i]},p4={narrow:/^[smtwf]/i,short:/^(su|mo|tu|we|th|fr|sa)/i,abbreviated:/^(sun|mon|tue|wed|thu|fri|sat)/i,wide:/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i},m4={narrow:[/^s/i,/^m/i,/^t/i,/^w/i,/^t/i,/^f/i,/^s/i],any:[/^su/i,/^m/i,/^tu/i,/^w/i,/^th/i,/^f/i,/^sa/i]},g4={narrow:/^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,any:/^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i},y4={any:{am:/^a/i,pm:/^p/i,midnight:/^mi/i,noon:/^no/i,morning:/morning/i,afternoon:/afternoon/i,evening:/evening/i,night:/night/i}},v4={ordinalNumber:s4({matchPattern:o4,parsePattern:a4,valueCallback:t=>parseInt(t,10)}),era:Lo({matchPatterns:l4,defaultMatchWidth:"wide",parsePatterns:u4,defaultParseWidth:"any"}),quarter:Lo({matchPatterns:c4,defaultMatchWidth:"wide",parsePatterns:h4,defaultParseWidth:"any",valueCallback:t=>t+1}),month:Lo({matchPatterns:d4,defaultMatchWidth:"wide",parsePatterns:f4,defaultParseWidth:"any"}),day:Lo({matchPatterns:p4,defaultMatchWidth:"wide",parsePatterns:m4,defaultParseWidth:"any"}),dayPeriod:Lo({matchPatterns:g4,defaultMatchWidth:"any",parsePatterns:y4,defaultParseWidth:"any"})},_4={code:"en-US",formatDistance:BF,formatLong:qF,formatRelative:KF,localize:n4,match:v4,options:{weekStartsOn:0,firstWeekContainsDate:1}};function w4(t){const e=hn(t);return LF(e,$F(e))+1}function E4(t){const e=hn(t),n=+Oc(e)-+VF(e);return Math.round(n/S1)+1}function k1(t,e){var d,p,m,w;const n=hn(t),r=n.getFullYear(),i=Mh(),s=(e==null?void 0:e.firstWeekContainsDate)??((p=(d=e==null?void 0:e.locale)==null?void 0:d.options)==null?void 0:p.firstWeekContainsDate)??i.firstWeekContainsDate??((w=(m=i.locale)==null?void 0:m.options)==null?void 0:w.firstWeekContainsDate)??1,o=Mi(t,0);o.setFullYear(r+1,0,s),o.setHours(0,0,0,0);const l=Qa(o,e),u=Mi(t,0);u.setFullYear(r,0,s),u.setHours(0,0,0,0);const c=Qa(u,e);return n.getTime()>=l.getTime()?r+1:n.getTime()>=c.getTime()?r:r-1}function I4(t,e){var l,u,c,d;const n=Mh(),r=(e==null?void 0:e.firstWeekContainsDate)??((u=(l=e==null?void 0:e.locale)==null?void 0:l.options)==null?void 0:u.firstWeekContainsDate)??n.firstWeekContainsDate??((d=(c=n.locale)==null?void 0:c.options)==null?void 0:d.firstWeekContainsDate)??1,i=k1(t,e),s=Mi(t,0);return s.setFullYear(i,0,r),s.setHours(0,0,0,0),Qa(s,e)}function T4(t,e){const n=hn(t),r=+Qa(n,e)-+I4(n,e);return Math.round(r/S1)+1}function ce(t,e){const n=t<0?"-":"",r=Math.abs(t).toString().padStart(e,"0");return n+r}const cr={y(t,e){const n=t.getFullYear(),r=n>0?n:1-n;return ce(e==="yy"?r%100:r,e.length)},M(t,e){const n=t.getMonth();return e==="M"?String(n+1):ce(n+1,2)},d(t,e){return ce(t.getDate(),e.length)},a(t,e){const n=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.toUpperCase();case"aaa":return n;case"aaaaa":return n[0];case"aaaa":default:return n==="am"?"a.m.":"p.m."}},h(t,e){return ce(t.getHours()%12||12,e.length)},H(t,e){return ce(t.getHours(),e.length)},m(t,e){return ce(t.getMinutes(),e.length)},s(t,e){return ce(t.getSeconds(),e.length)},S(t,e){const n=e.length,r=t.getMilliseconds(),i=Math.trunc(r*Math.pow(10,n-3));return ce(i,e.length)}},Zi={midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},hE={G:function(t,e,n){const r=t.getFullYear()>0?1:0;switch(e){case"G":case"GG":case"GGG":return n.era(r,{width:"abbreviated"});case"GGGGG":return n.era(r,{width:"narrow"});case"GGGG":default:return n.era(r,{width:"wide"})}},y:function(t,e,n){if(e==="yo"){const r=t.getFullYear(),i=r>0?r:1-r;return n.ordinalNumber(i,{unit:"year"})}return cr.y(t,e)},Y:function(t,e,n,r){const i=k1(t,r),s=i>0?i:1-i;if(e==="YY"){const o=s%100;return ce(o,2)}return e==="Yo"?n.ordinalNumber(s,{unit:"year"}):ce(s,e.length)},R:function(t,e){const n=P1(t);return ce(n,e.length)},u:function(t,e){const n=t.getFullYear();return ce(n,e.length)},Q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"Q":return String(r);case"QQ":return ce(r,2);case"Qo":return n.ordinalNumber(r,{unit:"quarter"});case"QQQ":return n.quarter(r,{width:"abbreviated",context:"formatting"});case"QQQQQ":return n.quarter(r,{width:"narrow",context:"formatting"});case"QQQQ":default:return n.quarter(r,{width:"wide",context:"formatting"})}},q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"q":return String(r);case"qq":return ce(r,2);case"qo":return n.ordinalNumber(r,{unit:"quarter"});case"qqq":return n.quarter(r,{width:"abbreviated",context:"standalone"});case"qqqqq":return n.quarter(r,{width:"narrow",context:"standalone"});case"qqqq":default:return n.quarter(r,{width:"wide",context:"standalone"})}},M:function(t,e,n){const r=t.getMonth();switch(e){case"M":case"MM":return cr.M(t,e);case"Mo":return n.ordinalNumber(r+1,{unit:"month"});case"MMM":return n.month(r,{width:"abbreviated",context:"formatting"});case"MMMMM":return n.month(r,{width:"narrow",context:"formatting"});case"MMMM":default:return n.month(r,{width:"wide",context:"formatting"})}},L:function(t,e,n){const r=t.getMonth();switch(e){case"L":return String(r+1);case"LL":return ce(r+1,2);case"Lo":return n.ordinalNumber(r+1,{unit:"month"});case"LLL":return n.month(r,{width:"abbreviated",context:"standalone"});case"LLLLL":return n.month(r,{width:"narrow",context:"standalone"});case"LLLL":default:return n.month(r,{width:"wide",context:"standalone"})}},w:function(t,e,n,r){const i=T4(t,r);return e==="wo"?n.ordinalNumber(i,{unit:"week"}):ce(i,e.length)},I:function(t,e,n){const r=E4(t);return e==="Io"?n.ordinalNumber(r,{unit:"week"}):ce(r,e.length)},d:function(t,e,n){return e==="do"?n.ordinalNumber(t.getDate(),{unit:"date"}):cr.d(t,e)},D:function(t,e,n){const r=w4(t);return e==="Do"?n.ordinalNumber(r,{unit:"dayOfYear"}):ce(r,e.length)},E:function(t,e,n){const r=t.getDay();switch(e){case"E":case"EE":case"EEE":return n.day(r,{width:"abbreviated",context:"formatting"});case"EEEEE":return n.day(r,{width:"narrow",context:"formatting"});case"EEEEEE":return n.day(r,{width:"short",context:"formatting"});case"EEEE":default:return n.day(r,{width:"wide",context:"formatting"})}},e:function(t,e,n,r){const i=t.getDay(),s=(i-r.weekStartsOn+8)%7||7;switch(e){case"e":return String(s);case"ee":return ce(s,2);case"eo":return n.ordinalNumber(s,{unit:"day"});case"eee":return n.day(i,{width:"abbreviated",context:"formatting"});case"eeeee":return n.day(i,{width:"narrow",context:"formatting"});case"eeeeee":return n.day(i,{width:"short",context:"formatting"});case"eeee":default:return n.day(i,{width:"wide",context:"formatting"})}},c:function(t,e,n,r){const i=t.getDay(),s=(i-r.weekStartsOn+8)%7||7;switch(e){case"c":return String(s);case"cc":return ce(s,e.length);case"co":return n.ordinalNumber(s,{unit:"day"});case"ccc":return n.day(i,{width:"abbreviated",context:"standalone"});case"ccccc":return n.day(i,{width:"narrow",context:"standalone"});case"cccccc":return n.day(i,{width:"short",context:"standalone"});case"cccc":default:return n.day(i,{width:"wide",context:"standalone"})}},i:function(t,e,n){const r=t.getDay(),i=r===0?7:r;switch(e){case"i":return String(i);case"ii":return ce(i,e.length);case"io":return n.ordinalNumber(i,{unit:"day"});case"iii":return n.day(r,{width:"abbreviated",context:"formatting"});case"iiiii":return n.day(r,{width:"narrow",context:"formatting"});case"iiiiii":return n.day(r,{width:"short",context:"formatting"});case"iiii":default:return n.day(r,{width:"wide",context:"formatting"})}},a:function(t,e,n){const i=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.dayPeriod(i,{width:"abbreviated",context:"formatting"});case"aaa":return n.dayPeriod(i,{width:"abbreviated",context:"formatting"}).toLowerCase();case"aaaaa":return n.dayPeriod(i,{width:"narrow",context:"formatting"});case"aaaa":default:return n.dayPeriod(i,{width:"wide",context:"formatting"})}},b:function(t,e,n){const r=t.getHours();let i;switch(r===12?i=Zi.noon:r===0?i=Zi.midnight:i=r/12>=1?"pm":"am",e){case"b":case"bb":return n.dayPeriod(i,{width:"abbreviated",context:"formatting"});case"bbb":return n.dayPeriod(i,{width:"abbreviated",context:"formatting"}).toLowerCase();case"bbbbb":return n.dayPeriod(i,{width:"narrow",context:"formatting"});case"bbbb":default:return n.dayPeriod(i,{width:"wide",context:"formatting"})}},B:function(t,e,n){const r=t.getHours();let i;switch(r>=17?i=Zi.evening:r>=12?i=Zi.afternoon:r>=4?i=Zi.morning:i=Zi.night,e){case"B":case"BB":case"BBB":return n.dayPeriod(i,{width:"abbreviated",context:"formatting"});case"BBBBB":return n.dayPeriod(i,{width:"narrow",context:"formatting"});case"BBBB":default:return n.dayPeriod(i,{width:"wide",context:"formatting"})}},h:function(t,e,n){if(e==="ho"){let r=t.getHours()%12;return r===0&&(r=12),n.ordinalNumber(r,{unit:"hour"})}return cr.h(t,e)},H:function(t,e,n){return e==="Ho"?n.ordinalNumber(t.getHours(),{unit:"hour"}):cr.H(t,e)},K:function(t,e,n){const r=t.getHours()%12;return e==="Ko"?n.ordinalNumber(r,{unit:"hour"}):ce(r,e.length)},k:function(t,e,n){let r=t.getHours();return r===0&&(r=24),e==="ko"?n.ordinalNumber(r,{unit:"hour"}):ce(r,e.length)},m:function(t,e,n){return e==="mo"?n.ordinalNumber(t.getMinutes(),{unit:"minute"}):cr.m(t,e)},s:function(t,e,n){return e==="so"?n.ordinalNumber(t.getSeconds(),{unit:"second"}):cr.s(t,e)},S:function(t,e){return cr.S(t,e)},X:function(t,e,n){const r=t.getTimezoneOffset();if(r===0)return"Z";switch(e){case"X":return fE(r);case"XXXX":case"XX":return hi(r);case"XXXXX":case"XXX":default:return hi(r,":")}},x:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"x":return fE(r);case"xxxx":case"xx":return hi(r);case"xxxxx":case"xxx":default:return hi(r,":")}},O:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"O":case"OO":case"OOO":return"GMT"+dE(r,":");case"OOOO":default:return"GMT"+hi(r,":")}},z:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"z":case"zz":case"zzz":return"GMT"+dE(r,":");case"zzzz":default:return"GMT"+hi(r,":")}},t:function(t,e,n){const r=Math.trunc(t.getTime()/1e3);return ce(r,e.length)},T:function(t,e,n){const r=t.getTime();return ce(r,e.length)}};function dE(t,e=""){const n=t>0?"-":"+",r=Math.abs(t),i=Math.trunc(r/60),s=r%60;return s===0?n+String(i):n+String(i)+e+ce(s,2)}function fE(t,e){return t%60===0?(t>0?"-":"+")+ce(Math.abs(t)/60,2):hi(t,e)}function hi(t,e=""){const n=t>0?"-":"+",r=Math.abs(t),i=ce(Math.trunc(r/60),2),s=ce(r%60,2);return n+i+e+s}const pE=(t,e)=>{switch(t){case"P":return e.date({width:"short"});case"PP":return e.date({width:"medium"});case"PPP":return e.date({width:"long"});case"PPPP":default:return e.date({width:"full"})}},R1=(t,e)=>{switch(t){case"p":return e.time({width:"short"});case"pp":return e.time({width:"medium"});case"ppp":return e.time({width:"long"});case"pppp":default:return e.time({width:"full"})}},S4=(t,e)=>{const n=t.match(/(P+)(p+)?/)||[],r=n[1],i=n[2];if(!i)return pE(t,e);let s;switch(r){case"P":s=e.dateTime({width:"short"});break;case"PP":s=e.dateTime({width:"medium"});break;case"PPP":s=e.dateTime({width:"long"});break;case"PPPP":default:s=e.dateTime({width:"full"});break}return s.replace("{{date}}",pE(r,e)).replace("{{time}}",R1(i,e))},A4={p:R1,P:S4},C4=/^D+$/,P4=/^Y+$/,k4=["D","DD","YY","YYYY"];function R4(t){return C4.test(t)}function b4(t){return P4.test(t)}function N4(t,e,n){const r=O4(t,e,n);if(console.warn(r),k4.includes(t))throw new RangeError(r)}function O4(t,e,n){const r=t[0]==="Y"?"years":"days of the month";return`Use \`${t.toLowerCase()}\` instead of \`${t}\` (in \`${e}\`) for formatting ${r} to the input \`${n}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`}const D4=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,x4=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,M4=/^'([^]*?)'?$/,L4=/''/g,V4=/[a-zA-Z]/;function F4(t,e,n){var d,p,m,w;const r=Mh(),i=r.locale??_4,s=r.firstWeekContainsDate??((p=(d=r.locale)==null?void 0:d.options)==null?void 0:p.firstWeekContainsDate)??1,o=r.weekStartsOn??((w=(m=r.locale)==null?void 0:m.options)==null?void 0:w.weekStartsOn)??0,l=hn(t);if(!UF(l))throw new RangeError("Invalid time value");let u=e.match(x4).map(C=>{const P=C[0];if(P==="p"||P==="P"){const N=A4[P];return N(C,i.formatLong)}return C}).join("").match(D4).map(C=>{if(C==="''")return{isToken:!1,value:"'"};const P=C[0];if(P==="'")return{isToken:!1,value:U4(C)};if(hE[P])return{isToken:!0,value:C};if(P.match(V4))throw new RangeError("Format string contains an unescaped latin alphabet character `"+P+"`");return{isToken:!1,value:C}});i.localize.preprocessor&&(u=i.localize.preprocessor(l,u));const c={firstWeekContainsDate:s,weekStartsOn:o,locale:i};return u.map(C=>{if(!C.isToken)return C.value;const P=C.value;(b4(P)||R4(P))&&N4(P,e,String(t));const N=hE[P[0]];return N(l,P,i.localize,c)}).join("")}function U4(t){const e=t.match(M4);return e?e[1].replace(L4,"'"):t}function $4(t,e){const r=H4(t);let i;if(r.date){const u=W4(r.date,2);i=q4(u.restDateString,u.year)}if(!i||isNaN(i.getTime()))return new Date(NaN);const s=i.getTime();let o=0,l;if(r.time&&(o=G4(r.time),isNaN(o)))return new Date(NaN);if(r.timezone){if(l=K4(r.timezone),isNaN(l))return new Date(NaN)}else{const u=new Date(s+o),c=new Date(0);return c.setFullYear(u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate()),c.setHours(u.getUTCHours(),u.getUTCMinutes(),u.getUTCSeconds(),u.getUTCMilliseconds()),c}return new Date(s+o+l)}const cu={dateTimeDelimiter:/[T ]/,timeZoneDelimiter:/[Z ]/i,timezone:/([Z+-].*)$/},j4=/^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,B4=/^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,z4=/^([+-])(\d{2})(?::?(\d{2}))?$/;function H4(t){const e={},n=t.split(cu.dateTimeDelimiter);let r;if(n.length>2)return e;if(/:/.test(n[0])?r=n[0]:(e.date=n[0],r=n[1],cu.timeZoneDelimiter.test(e.date)&&(e.date=t.split(cu.timeZoneDelimiter)[0],r=t.substr(e.date.length,t.length))),r){const i=cu.timezone.exec(r);i?(e.time=r.replace(i[1],""),e.timezone=i[1]):e.time=r}return e}function W4(t,e){const n=new RegExp("^(?:(\\d{4}|[+-]\\d{"+(4+e)+"})|(\\d{2}|[+-]\\d{"+(2+e)+"})$)"),r=t.match(n);if(!r)return{year:NaN,restDateString:""};const i=r[1]?parseInt(r[1]):null,s=r[2]?parseInt(r[2]):null;return{year:s===null?i:s*100,restDateString:t.slice((r[1]||r[2]).length)}}function q4(t,e){if(e===null)return new Date(NaN);const n=t.match(j4);if(!n)return new Date(NaN);const r=!!n[4],i=Vo(n[1]),s=Vo(n[2])-1,o=Vo(n[3]),l=Vo(n[4]),u=Vo(n[5])-1;if(r)return Z4(e,l,u)?Q4(e,l,u):new Date(NaN);{const c=new Date(0);return!J4(e,s,o)||!X4(e,i)?new Date(NaN):(c.setUTCFullYear(e,s,Math.max(i,o)),c)}}function Vo(t){return t?parseInt(t):1}function G4(t){const e=t.match(B4);if(!e)return NaN;const n=ef(e[1]),r=ef(e[2]),i=ef(e[3]);return eU(n,r,i)?n*C1+r*A1+i*1e3:NaN}function ef(t){return t&&parseFloat(t.replace(",","."))||0}function K4(t){if(t==="Z")return 0;const e=t.match(z4);if(!e)return 0;const n=e[1]==="+"?-1:1,r=parseInt(e[2]),i=e[3]&&parseInt(e[3])||0;return tU(r,i)?n*(r*C1+i*A1):NaN}function Q4(t,e,n){const r=new Date(0);r.setUTCFullYear(t,0,4);const i=r.getUTCDay()||7,s=(e-1)*7+n+1-i;return r.setUTCDate(r.getUTCDate()+s),r}const Y4=[31,null,31,30,31,30,31,31,30,31,30,31];function b1(t){return t%400===0||t%4===0&&t%100!==0}function J4(t,e,n){return e>=0&&e<=11&&n>=1&&n<=(Y4[e]||(b1(t)?29:28))}function X4(t,e){return e>=1&&e<=(b1(t)?366:365)}function Z4(t,e,n){return e>=1&&e<=53&&n>=0&&n<=6}function eU(t,e,n){return t===24?e===0&&n===0:n>=0&&n<60&&e>=0&&e<60&&t>=0&&t<25}function tU(t,e){return e>=0&&e<=59}var mE={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const N1=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},nU=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],l=t[n++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},O1={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,l=o?t[i+1]:0,u=i+2<t.length,c=u?t[i+2]:0,d=s>>2,p=(s&3)<<4|l>>4;let m=(l&15)<<2|c>>6,w=c&63;u||(w=64,o||(m=64)),r.push(n[d],n[p],n[m],n[w])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(N1(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):nU(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],l=i<t.length?n[t.charAt(i)]:0;++i;const c=i<t.length?n[t.charAt(i)]:64;++i;const p=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||l==null||c==null||p==null)throw new rU;const m=s<<2|l>>4;if(r.push(m),c!==64){const w=l<<4&240|c>>2;if(r.push(w),p!==64){const C=c<<6&192|p;r.push(C)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class rU extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const iU=function(t){const e=N1(t);return O1.encodeByteArray(e,!0)},D1=function(t){return iU(t).replace(/\./g,"")},x1=function(t){try{return O1.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sU(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oU=()=>sU().__FIREBASE_DEFAULTS__,aU=()=>{if(typeof process>"u"||typeof mE>"u")return;const t=mE.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},lU=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&x1(t[1]);return e&&JSON.parse(e)},Bg=()=>{try{return oU()||aU()||lU()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},uU=t=>{var e,n;return(n=(e=Bg())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},M1=()=>{var t;return(t=Bg())===null||t===void 0?void 0:t.config},L1=t=>{var e;return(e=Bg())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cU{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function hU(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(mt())}function dU(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function fU(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function pU(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function mU(){const t=mt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function gU(){try{return typeof indexedDB=="object"}catch{return!1}}function yU(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vU="FirebaseError";class ni extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=vU,Object.setPrototypeOf(this,ni.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,yl.prototype.create)}}class yl{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?_U(s,r):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new ni(i,l,r)}}function _U(t,e){return t.replace(wU,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const wU=/\{\$([^}]+)}/g;function EU(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Dc(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(gE(s)&&gE(o)){if(!Dc(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function gE(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vl(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function IU(t,e){const n=new TU(t,e);return n.subscribe.bind(n)}class TU{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");SU(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=tf),i.error===void 0&&(i.error=tf),i.complete===void 0&&(i.complete=tf);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function SU(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function tf(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qi(t){return t&&t._delegate?t._delegate:t}class Qs{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const di="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AU{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new cU;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(PU(e))try{this.getOrInitializeService({instanceIdentifier:di})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=di){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=di){return this.instances.has(e)}getOptions(e=di){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&o.resolve(i)}return i}onInit(e,n){var r;const i=this.normalizeInstanceIdentifier(n),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:CU(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=di){return this.component?this.component.multipleInstances?e:di:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function CU(t){return t===di?void 0:t}function PU(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kU{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new AU(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var fe;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(fe||(fe={}));const RU={debug:fe.DEBUG,verbose:fe.VERBOSE,info:fe.INFO,warn:fe.WARN,error:fe.ERROR,silent:fe.SILENT},bU=fe.INFO,NU={[fe.DEBUG]:"log",[fe.VERBOSE]:"log",[fe.INFO]:"info",[fe.WARN]:"warn",[fe.ERROR]:"error"},OU=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=NU[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class V1{constructor(e){this.name=e,this._logLevel=bU,this._logHandler=OU,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in fe))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?RU[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,fe.DEBUG,...e),this._logHandler(this,fe.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,fe.VERBOSE,...e),this._logHandler(this,fe.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,fe.INFO,...e),this._logHandler(this,fe.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,fe.WARN,...e),this._logHandler(this,fe.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,fe.ERROR,...e),this._logHandler(this,fe.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DU{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(xU(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function xU(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const xp="@firebase/app",yE="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zn=new V1("@firebase/app"),MU="@firebase/app-compat",LU="@firebase/analytics-compat",VU="@firebase/analytics",FU="@firebase/app-check-compat",UU="@firebase/app-check",$U="@firebase/auth",jU="@firebase/auth-compat",BU="@firebase/database",zU="@firebase/data-connect",HU="@firebase/database-compat",WU="@firebase/functions",qU="@firebase/functions-compat",GU="@firebase/installations",KU="@firebase/installations-compat",QU="@firebase/messaging",YU="@firebase/messaging-compat",JU="@firebase/performance",XU="@firebase/performance-compat",ZU="@firebase/remote-config",e$="@firebase/remote-config-compat",t$="@firebase/storage",n$="@firebase/storage-compat",r$="@firebase/firestore",i$="@firebase/vertexai-preview",s$="@firebase/firestore-compat",o$="firebase",a$="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mp="[DEFAULT]",l$={[xp]:"fire-core",[MU]:"fire-core-compat",[VU]:"fire-analytics",[LU]:"fire-analytics-compat",[UU]:"fire-app-check",[FU]:"fire-app-check-compat",[$U]:"fire-auth",[jU]:"fire-auth-compat",[BU]:"fire-rtdb",[zU]:"fire-data-connect",[HU]:"fire-rtdb-compat",[WU]:"fire-fn",[qU]:"fire-fn-compat",[GU]:"fire-iid",[KU]:"fire-iid-compat",[QU]:"fire-fcm",[YU]:"fire-fcm-compat",[JU]:"fire-perf",[XU]:"fire-perf-compat",[ZU]:"fire-rc",[e$]:"fire-rc-compat",[t$]:"fire-gcs",[n$]:"fire-gcs-compat",[r$]:"fire-fst",[s$]:"fire-fst-compat",[i$]:"fire-vertex","fire-js":"fire-js",[o$]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xc=new Map,u$=new Map,Lp=new Map;function vE(t,e){try{t.container.addComponent(e)}catch(n){Zn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Ya(t){const e=t.name;if(Lp.has(e))return Zn.debug(`There were multiple attempts to register component ${e}.`),!1;Lp.set(e,t);for(const n of xc.values())vE(n,t);for(const n of u$.values())vE(n,t);return!0}function F1(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Sr(t){return t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c$={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ur=new yl("app","Firebase",c$);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class h${constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Qs("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ur.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _l=a$;function d$(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Mp,automaticDataCollectionEnabled:!1},e),i=r.name;if(typeof i!="string"||!i)throw Ur.create("bad-app-name",{appName:String(i)});if(n||(n=M1()),!n)throw Ur.create("no-options");const s=xc.get(i);if(s){if(Dc(n,s.options)&&Dc(r,s.config))return s;throw Ur.create("duplicate-app",{appName:i})}const o=new kU(i);for(const u of Lp.values())o.addComponent(u);const l=new h$(n,r,o);return xc.set(i,l),l}function f$(t=Mp){const e=xc.get(t);if(!e&&t===Mp&&M1())return d$();if(!e)throw Ur.create("no-app",{appName:t});return e}function fa(t,e,n){var r;let i=(r=l$[t])!==null&&r!==void 0?r:t;n&&(i+=`-${n}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const l=[`Unable to register library "${i}" with version "${e}":`];s&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&l.push("and"),o&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Zn.warn(l.join(" "));return}Ya(new Qs(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const p$="firebase-heartbeat-database",m$=1,Ja="firebase-heartbeat-store";let nf=null;function U1(){return nf||(nf=ol(p$,m$,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Ja)}catch(n){console.warn(n)}}}}).catch(t=>{throw Ur.create("idb-open",{originalErrorMessage:t.message})})),nf}async function g$(t){try{const n=(await U1()).transaction(Ja),r=await n.objectStore(Ja).get($1(t));return await n.done,r}catch(e){if(e instanceof ni)Zn.warn(e.message);else{const n=Ur.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Zn.warn(n.message)}}}async function _E(t,e){try{const r=(await U1()).transaction(Ja,"readwrite");await r.objectStore(Ja).put(e,$1(t)),await r.done}catch(n){if(n instanceof ni)Zn.warn(n.message);else{const r=Ur.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Zn.warn(r.message)}}}function $1(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const y$=1024,v$=30*24*60*60*1e3;class _${constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new E$(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=wE();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s)?void 0:(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{const l=new Date(o.date).valueOf();return Date.now()-l<=v$}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Zn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=wE(),{heartbeatsToSend:r,unsentEntries:i}=w$(this._heartbeatsCache.heartbeats),s=D1(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return Zn.warn(n),""}}}function wE(){return new Date().toISOString().substring(0,10)}function w$(t,e=y$){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),EE(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),EE(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class E${constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return gU()?yU().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await g$(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return _E(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return _E(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function EE(t){return D1(JSON.stringify({version:2,heartbeats:t})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function I$(t){Ya(new Qs("platform-logger",e=>new DU(e),"PRIVATE")),Ya(new Qs("heartbeat",e=>new _$(e),"PRIVATE")),fa(xp,yE,t),fa(xp,yE,"esm2017"),fa("fire-js","")}I$("");function j1(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const T$=j1,B1=new yl("auth","Firebase",j1());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mc=new V1("@firebase/auth");function S$(t,...e){Mc.logLevel<=fe.WARN&&Mc.warn(`Auth (${_l}): ${t}`,...e)}function Mu(t,...e){Mc.logLevel<=fe.ERROR&&Mc.error(`Auth (${_l}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function er(t,...e){throw zg(t,...e)}function An(t,...e){return zg(t,...e)}function z1(t,e,n){const r=Object.assign(Object.assign({},T$()),{[e]:n});return new yl("auth","Firebase",r).create(e,{appName:t.name})}function Ti(t){return z1(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function zg(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return B1.create(t,...e)}function X(t,e,...n){if(!t)throw zg(e,...n)}function $n(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Mu(e),new Error(e)}function tr(t,e){t||$n(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vp(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function A$(){return IE()==="http:"||IE()==="https:"}function IE(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function C$(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(A$()||fU()||"connection"in navigator)?navigator.onLine:!0}function P$(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wl{constructor(e,n){this.shortDelay=e,this.longDelay=n,tr(n>e,"Short delay should be less than long delay!"),this.isMobile=hU()||pU()}get(){return C$()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hg(t,e){tr(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H1{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;$n("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;$n("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;$n("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k$={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R$=new wl(3e4,6e4);function Wg(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function co(t,e,n,r,i={}){return W1(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const l=vl(Object.assign({key:t.config.apiKey},o)).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const c=Object.assign({method:e,headers:u},s);return dU()||(c.referrerPolicy="no-referrer"),H1.fetch()(q1(t,t.config.apiHost,n,l),c)})}async function W1(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},k$),e);try{const i=new N$(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw hu(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const l=s.ok?o.errorMessage:o.error.message,[u,c]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw hu(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw hu(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw hu(t,"user-disabled",o);const d=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw z1(t,d,c);er(t,d)}}catch(i){if(i instanceof ni)throw i;er(t,"network-request-failed",{message:String(i)})}}async function b$(t,e,n,r,i={}){const s=await co(t,e,n,r,i);return"mfaPendingCredential"in s&&er(t,"multi-factor-auth-required",{_serverResponse:s}),s}function q1(t,e,n,r){const i=`${e}${n}?${r}`;return t.config.emulator?Hg(t.config,i):`${t.config.apiScheme}://${i}`}class N${constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(An(this.auth,"network-request-failed")),R$.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function hu(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=An(t,e,r);return i.customData._tokenResponse=n,i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function O$(t,e){return co(t,"POST","/v1/accounts:delete",e)}async function G1(t,e){return co(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pa(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function D$(t,e=!1){const n=qi(t),r=await n.getIdToken(e),i=qg(r);X(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:pa(rf(i.auth_time)),issuedAtTime:pa(rf(i.iat)),expirationTime:pa(rf(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function rf(t){return Number(t)*1e3}function qg(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return Mu("JWT malformed, contained fewer than 3 sections"),null;try{const i=x1(n);return i?JSON.parse(i):(Mu("Failed to decode base64 JWT payload"),null)}catch(i){return Mu("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function TE(t){const e=qg(t);return X(e,"internal-error"),X(typeof e.exp<"u","internal-error"),X(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xa(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof ni&&x$(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function x$({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M${constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fp{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=pa(this.lastLoginAt),this.creationTime=pa(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Lc(t){var e;const n=t.auth,r=await t.getIdToken(),i=await Xa(t,G1(n,{idToken:r}));X(i==null?void 0:i.users.length,n,"internal-error");const s=i.users[0];t._notifyReloadListener(s);const o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?K1(s.providerUserInfo):[],l=V$(t.providerData,o),u=t.isAnonymous,c=!(t.email&&s.passwordHash)&&!(l!=null&&l.length),d=u?c:!1,p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:l,metadata:new Fp(s.createdAt,s.lastLoginAt),isAnonymous:d};Object.assign(t,p)}async function L$(t){const e=qi(t);await Lc(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function V$(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function K1(t){return t.map(e=>{var{providerId:n}=e,r=lo(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function F$(t,e){const n=await W1(t,{},async()=>{const r=vl({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=q1(t,i,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",H1.fetch()(o,{method:"POST",headers:l,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function U$(t,e){return co(t,"POST","/v2/accounts:revokeToken",Wg(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bs{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){X(e.idToken,"internal-error"),X(typeof e.idToken<"u","internal-error"),X(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):TE(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){X(e.length!==0,"internal-error");const n=TE(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(X(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await F$(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new bs;return r&&(X(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(X(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(X(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new bs,this.toJSON())}_performRefresh(){return $n("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hr(t,e){X(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class jn{constructor(e){var{uid:n,auth:r,stsTokenManager:i}=e,s=lo(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new M$(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Fp(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const n=await Xa(this,this.stsTokenManager.getToken(this.auth,e));return X(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return D$(this,e)}reload(){return L$(this)}_assign(e){this!==e&&(X(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new jn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){X(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await Lc(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Sr(this.auth.app))return Promise.reject(Ti(this.auth));const e=await this.getIdToken();return await Xa(this,O$(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,i,s,o,l,u,c,d;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,m=(i=n.email)!==null&&i!==void 0?i:void 0,w=(s=n.phoneNumber)!==null&&s!==void 0?s:void 0,C=(o=n.photoURL)!==null&&o!==void 0?o:void 0,P=(l=n.tenantId)!==null&&l!==void 0?l:void 0,N=(u=n._redirectEventId)!==null&&u!==void 0?u:void 0,I=(c=n.createdAt)!==null&&c!==void 0?c:void 0,y=(d=n.lastLoginAt)!==null&&d!==void 0?d:void 0,{uid:S,emailVerified:b,isAnonymous:F,providerData:$,stsTokenManager:_}=n;X(S&&_,e,"internal-error");const v=bs.fromJSON(this.name,_);X(typeof S=="string",e,"internal-error"),hr(p,e.name),hr(m,e.name),X(typeof b=="boolean",e,"internal-error"),X(typeof F=="boolean",e,"internal-error"),hr(w,e.name),hr(C,e.name),hr(P,e.name),hr(N,e.name),hr(I,e.name),hr(y,e.name);const E=new jn({uid:S,auth:e,email:m,emailVerified:b,displayName:p,isAnonymous:F,photoURL:C,phoneNumber:w,tenantId:P,stsTokenManager:v,createdAt:I,lastLoginAt:y});return $&&Array.isArray($)&&(E.providerData=$.map(T=>Object.assign({},T))),N&&(E._redirectEventId=N),E}static async _fromIdTokenResponse(e,n,r=!1){const i=new bs;i.updateFromServerResponse(n);const s=new jn({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await Lc(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];X(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?K1(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new bs;l.updateFromIdToken(r);const u=new jn({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),c={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Fp(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,c),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SE=new Map;function Bn(t){tr(t instanceof Function,"Expected a class definition");let e=SE.get(t);return e?(tr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,SE.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q1{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Q1.type="NONE";const AE=Q1;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lu(t,e,n){return`firebase:${t}:${e}:${n}`}class Ns{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Lu(this.userKey,i.apiKey,s),this.fullPersistenceKey=Lu("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?jn._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Ns(Bn(AE),e,r);const i=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c);let s=i[0]||Bn(AE);const o=Lu(r,e.config.apiKey,e.name);let l=null;for(const c of n)try{const d=await c._get(o);if(d){const p=jn._fromJSON(e,d);c!==s&&(l=p),s=c;break}}catch{}const u=i.filter(c=>c._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Ns(s,e,r):(s=u[0],l&&await s._set(o,l.toJSON()),await Promise.all(n.map(async c=>{if(c!==s)try{await c._remove(o)}catch{}})),new Ns(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CE(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Z1(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Y1(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(tC(e))return"Blackberry";if(nC(e))return"Webos";if(J1(e))return"Safari";if((e.includes("chrome/")||X1(e))&&!e.includes("edge/"))return"Chrome";if(eC(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Y1(t=mt()){return/firefox\//i.test(t)}function J1(t=mt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function X1(t=mt()){return/crios\//i.test(t)}function Z1(t=mt()){return/iemobile/i.test(t)}function eC(t=mt()){return/android/i.test(t)}function tC(t=mt()){return/blackberry/i.test(t)}function nC(t=mt()){return/webos/i.test(t)}function Gg(t=mt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function $$(t=mt()){var e;return Gg(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function j$(){return mU()&&document.documentMode===10}function rC(t=mt()){return Gg(t)||eC(t)||nC(t)||tC(t)||/windows phone/i.test(t)||Z1(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iC(t,e=[]){let n;switch(t){case"Browser":n=CE(mt());break;case"Worker":n=`${CE(mt())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${_l}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B${constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,l)=>{try{const u=e(s);o(u)}catch(u){l(u)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function z$(t,e={}){return co(t,"GET","/v2/passwordPolicy",Wg(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H$=6;class W${constructor(e){var n,r,i,s;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=o.minPasswordLength)!==null&&n!==void 0?n:H$,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,i,s,o,l;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(n=u.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(i=u.containsLowercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(s=u.containsUppercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(l=u.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),u}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q${constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new PE(this),this.idTokenSubscription=new PE(this),this.beforeStateQueue=new B$(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=B1,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Bn(n)),this._initializationPromise=this.queue(async()=>{var r,i;if(!this._deleted&&(this.persistenceManager=await Ns.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await G1(this,{idToken:e}),r=await jn._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(Sr(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=i==null?void 0:i._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===l)&&(u!=null&&u.user)&&(i=u.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return X(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Lc(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=P$()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Sr(this.app))return Promise.reject(Ti(this));const n=e?qi(e):null;return n&&X(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&X(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Sr(this.app)?Promise.reject(Ti(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Sr(this.app)?Promise.reject(Ti(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Bn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await z$(this),n=new W$(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new yl("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await U$(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Bn(e)||this._popupRedirectResolver;X(n,this,"argument-error"),this.redirectPersistenceManager=await Ns.create(this,[Bn(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(X(l,this,"internal-error"),l.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const u=e.addObserver(n,r,i);return()=>{o=!0,u()}}else{const u=e.addObserver(n);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return X(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=iC(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(n["X-Firebase-AppCheck"]=i),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&S$(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Kg(t){return qi(t)}class PE{constructor(e){this.auth=e,this.observer=null,this.addObserver=IU(n=>this.observer=n)}get next(){return X(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Qg={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function G$(t){Qg=t}function K$(t){return Qg.loadJS(t)}function Q$(){return Qg.gapiScript}function Y$(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function J$(t,e){const n=F1(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if(Dc(s,e??{}))return i;er(i,"already-initialized")}return n.initialize({options:e})}function X$(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(Bn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Z$(t,e,n){const r=Kg(t);X(r._canInitEmulator,r,"emulator-config-failed"),X(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=sC(e),{host:o,port:l}=e6(e),u=l===null?"":`:${l}`;r.config.emulator={url:`${s}//${o}${u}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:o,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})}),t6()}function sC(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function e6(t){const e=sC(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:kE(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:kE(o)}}}function kE(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function t6(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oC{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return $n("not implemented")}_getIdTokenResponse(e){return $n("not implemented")}_linkToIdToken(e,n){return $n("not implemented")}_getReauthenticationResolver(e){return $n("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Os(t,e){return b$(t,"POST","/v1/accounts:signInWithIdp",Wg(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const n6="http://localhost";class Li extends oC{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new Li(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):er("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=n,s=lo(n,["providerId","signInMethod"]);if(!r||!i)return null;const o=new Li(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Os(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Os(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Os(e,n)}buildRequest(){const e={requestUri:n6,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=vl(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aC{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class El extends aC{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gr extends El{constructor(){super("facebook.com")}static credential(e){return Li._fromParams({providerId:gr.PROVIDER_ID,signInMethod:gr.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return gr.credentialFromTaggedObject(e)}static credentialFromError(e){return gr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return gr.credential(e.oauthAccessToken)}catch{return null}}}gr.FACEBOOK_SIGN_IN_METHOD="facebook.com";gr.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yr extends El{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Li._fromParams({providerId:yr.PROVIDER_ID,signInMethod:yr.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return yr.credentialFromTaggedObject(e)}static credentialFromError(e){return yr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return yr.credential(n,r)}catch{return null}}}yr.GOOGLE_SIGN_IN_METHOD="google.com";yr.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vr extends El{constructor(){super("github.com")}static credential(e){return Li._fromParams({providerId:vr.PROVIDER_ID,signInMethod:vr.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return vr.credentialFromTaggedObject(e)}static credentialFromError(e){return vr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return vr.credential(e.oauthAccessToken)}catch{return null}}}vr.GITHUB_SIGN_IN_METHOD="github.com";vr.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _r extends El{constructor(){super("twitter.com")}static credential(e,n){return Li._fromParams({providerId:_r.PROVIDER_ID,signInMethod:_r.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return _r.credentialFromTaggedObject(e)}static credentialFromError(e){return _r.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return _r.credential(n,r)}catch{return null}}}_r.TWITTER_SIGN_IN_METHOD="twitter.com";_r.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ys{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await jn._fromIdTokenResponse(e,r,i),o=RE(r);return new Ys({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=RE(r);return new Ys({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function RE(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vc extends ni{constructor(e,n,r,i){var s;super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,Vc.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new Vc(e,n,r,i)}}function lC(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Vc._fromErrorAndOperation(t,s,e,r):s})}async function r6(t,e,n=!1){const r=await Xa(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Ys._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function i6(t,e,n=!1){const{auth:r}=t;if(Sr(r.app))return Promise.reject(Ti(r));const i="reauthenticate";try{const s=await Xa(t,lC(r,i,e,t),n);X(s.idToken,r,"internal-error");const o=qg(s.idToken);X(o,r,"internal-error");const{sub:l}=o;return X(t.uid===l,r,"user-mismatch"),Ys._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&er(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function s6(t,e,n=!1){if(Sr(t.app))return Promise.reject(Ti(t));const r="signIn",i=await lC(t,r,e),s=await Ys._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}function o6(t,e,n,r){return qi(t).onIdTokenChanged(e,n,r)}function a6(t,e,n){return qi(t).beforeAuthStateChanged(e,n)}function l6(t,e,n,r){return qi(t).onAuthStateChanged(e,n,r)}const Fc="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uC{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Fc,"1"),this.storage.removeItem(Fc),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const u6=1e3,c6=10;class cC extends uC{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=rC(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,u)=>{this.notifyListeners(o,u)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);j$()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,c6):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},u6)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}cC.type="LOCAL";const h6=cC;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hC extends uC{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}hC.type="SESSION";const dC=hC;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function d6(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lh{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(i=>i.isListeningto(e));if(n)return n;const r=new Lh(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:i,data:s}=n.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const l=Array.from(o).map(async c=>c(n.origin,s)),u=await d6(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Lh.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yg(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f6{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((l,u)=>{const c=Yg("",20);i.port1.start();const d=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(p){const m=p;if(m.data.eventId===c)switch(m.data.status){case"ack":clearTimeout(d),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(m.data.response);break;default:clearTimeout(d),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cn(){return window}function p6(t){Cn().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fC(){return typeof Cn().WorkerGlobalScope<"u"&&typeof Cn().importScripts=="function"}async function m6(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function g6(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function y6(){return fC()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pC="firebaseLocalStorageDb",v6=1,Uc="firebaseLocalStorage",mC="fbase_key";class Il{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Vh(t,e){return t.transaction([Uc],e?"readwrite":"readonly").objectStore(Uc)}function _6(){const t=indexedDB.deleteDatabase(pC);return new Il(t).toPromise()}function Up(){const t=indexedDB.open(pC,v6);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(Uc,{keyPath:mC})}catch(i){n(i)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(Uc)?e(r):(r.close(),await _6(),e(await Up()))})})}async function bE(t,e,n){const r=Vh(t,!0).put({[mC]:e,value:n});return new Il(r).toPromise()}async function w6(t,e){const n=Vh(t,!1).get(e),r=await new Il(n).toPromise();return r===void 0?null:r.value}function NE(t,e){const n=Vh(t,!0).delete(e);return new Il(n).toPromise()}const E6=800,I6=3;class gC{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Up(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>I6)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return fC()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Lh._getInstance(y6()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await m6(),!this.activeServiceWorker)return;this.sender=new f6(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||g6()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Up();return await bE(e,Fc,"1"),await NE(e,Fc),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>bE(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>w6(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>NE(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Vh(i,!1).getAll();return new Il(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),n.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),n.push(i));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),E6)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}gC.type="LOCAL";const T6=gC;new wl(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function S6(t,e){return e?Bn(e):(X(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jg extends oC{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Os(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Os(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Os(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function A6(t){return s6(t.auth,new Jg(t),t.bypassAuthState)}function C6(t){const{auth:e,user:n}=t;return X(n,e,"internal-error"),i6(n,new Jg(t),t.bypassAuthState)}async function P6(t){const{auth:e,user:n}=t;return X(n,e,"internal-error"),r6(n,new Jg(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yC{constructor(e,n,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:i,tenantId:s,error:o,type:l}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:n,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return A6;case"linkViaPopup":case"linkViaRedirect":return P6;case"reauthViaPopup":case"reauthViaRedirect":return C6;default:er(this.auth,"internal-error")}}resolve(e){tr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){tr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k6=new wl(2e3,1e4);class Es extends yC{constructor(e,n,r,i,s){super(e,n,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Es.currentPopupAction&&Es.currentPopupAction.cancel(),Es.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return X(e,this.auth,"internal-error"),e}async onExecution(){tr(this.filter.length===1,"Popup operations only handle one event");const e=Yg();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(An(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(An(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Es.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(An(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,k6.get())};e()}}Es.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R6="pendingRedirect",Vu=new Map;class b6 extends yC{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=Vu.get(this.auth._key());if(!e){try{const r=await N6(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}Vu.set(this.auth._key(),e)}return this.bypassAuthState||Vu.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function N6(t,e){const n=x6(e),r=D6(t);if(!await r._isAvailable())return!1;const i=await r._get(n)==="true";return await r._remove(n),i}function O6(t,e){Vu.set(t._key(),e)}function D6(t){return Bn(t._redirectPersistence)}function x6(t){return Lu(R6,t.config.apiKey,t.name)}async function M6(t,e,n=!1){if(Sr(t.app))return Promise.reject(Ti(t));const r=Kg(t),i=S6(r,e),o=await new b6(r,i,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L6=10*60*1e3;class V6{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!F6(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!vC(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(An(this.auth,i))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=L6&&this.cachedEventUids.clear(),this.cachedEventUids.has(OE(e))}saveEventToCache(e){this.cachedEventUids.add(OE(e)),this.lastProcessedEventTime=Date.now()}}function OE(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function vC({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function F6(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return vC(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function U6(t,e={}){return co(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $6=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,j6=/^https?/;async function B6(t){if(t.config.emulator)return;const{authorizedDomains:e}=await U6(t);for(const n of e)try{if(z6(n))return}catch{}er(t,"unauthorized-domain")}function z6(t){const e=Vp(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!j6.test(n))return!1;if($6.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H6=new wl(3e4,6e4);function DE(){const t=Cn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function W6(t){return new Promise((e,n)=>{var r,i,s;function o(){DE(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{DE(),n(An(t,"network-request-failed"))},timeout:H6.get()})}if(!((i=(r=Cn().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=Cn().gapi)===null||s===void 0)&&s.load)o();else{const l=Y$("iframefcb");return Cn()[l]=()=>{gapi.load?o():n(An(t,"network-request-failed"))},K$(`${Q$()}?onload=${l}`).catch(u=>n(u))}}).catch(e=>{throw Fu=null,e})}let Fu=null;function q6(t){return Fu=Fu||W6(t),Fu}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const G6=new wl(5e3,15e3),K6="__/auth/iframe",Q6="emulator/auth/iframe",Y6={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},J6=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function X6(t){const e=t.config;X(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Hg(e,Q6):`https://${t.config.authDomain}/${K6}`,r={apiKey:e.apiKey,appName:t.name,v:_l},i=J6.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${vl(r).slice(1)}`}async function Z6(t){const e=await q6(t),n=Cn().gapi;return X(n,t,"internal-error"),e.open({where:document.body,url:X6(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Y6,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=An(t,"network-request-failed"),l=Cn().setTimeout(()=>{s(o)},G6.get());function u(){Cn().clearTimeout(l),i(r)}r.ping(u).then(u,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const e3={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},t3=500,n3=600,r3="_blank",i3="http://localhost";class xE{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function s3(t,e,n,r=t3,i=n3){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const u=Object.assign(Object.assign({},e3),{width:r.toString(),height:i.toString(),top:s,left:o}),c=mt().toLowerCase();n&&(l=X1(c)?r3:n),Y1(c)&&(e=e||i3,u.scrollbars="yes");const d=Object.entries(u).reduce((m,[w,C])=>`${m}${w}=${C},`,"");if($$(c)&&l!=="_self")return o3(e||"",l),new xE(null);const p=window.open(e||"",l,d);X(p,t,"popup-blocked");try{p.focus()}catch{}return new xE(p)}function o3(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const a3="__/auth/handler",l3="emulator/auth/handler",u3=encodeURIComponent("fac");async function ME(t,e,n,r,i,s){X(t.config.authDomain,t,"auth-domain-config-required"),X(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:_l,eventId:i};if(e instanceof aC){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",EU(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries({}))o[d]=p}if(e instanceof El){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(o.scopes=d.join(","))}t.tenantId&&(o.tid=t.tenantId);const l=o;for(const d of Object.keys(l))l[d]===void 0&&delete l[d];const u=await t._getAppCheckToken(),c=u?`#${u3}=${encodeURIComponent(u)}`:"";return`${c3(t)}?${vl(l).slice(1)}${c}`}function c3({config:t}){return t.emulator?Hg(t,l3):`https://${t.authDomain}/${a3}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sf="webStorageSupport";class h3{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=dC,this._completeRedirectFn=M6,this._overrideRedirectResult=O6}async _openPopup(e,n,r,i){var s;tr((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const o=await ME(e,n,r,Vp(),i);return s3(e,o,Yg())}async _openRedirect(e,n,r,i){await this._originValidation(e);const s=await ME(e,n,r,Vp(),i);return p6(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:i,promise:s}=this.eventManagers[n];return i?Promise.resolve(i):(tr(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await Z6(e),r=new V6(e);return n.register("authEvent",i=>(X(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(sf,{type:sf},i=>{var s;const o=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[sf];o!==void 0&&n(!!o),er(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=B6(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return rC()||J1()||Gg()}}const d3=h3;var LE="@firebase/auth",VE="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f3{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){X(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function p3(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function m3(t){Ya(new Qs("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;X(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:iC(t)},c=new q$(r,i,s,u);return X$(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),Ya(new Qs("auth-internal",e=>{const n=Kg(e.getProvider("auth").getImmediate());return(r=>new f3(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),fa(LE,VE,p3(t)),fa(LE,VE,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g3=5*60,y3=L1("authIdTokenMaxAge")||g3;let FE=null;const v3=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>y3)return;const i=n==null?void 0:n.token;FE!==i&&(FE=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function _3(t=f$()){const e=F1(t,"auth");if(e.isInitialized())return e.getImmediate();const n=J$(t,{popupRedirectResolver:d3,persistence:[T6,h6,dC]}),r=L1("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=v3(s.toString());a6(n,o,()=>o(n.currentUser)),o6(n,l=>o(l))}}const i=uU("auth");return i&&Z$(n,`http://${i}`),n}function w3(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}G$({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=An("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",w3().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});m3("Browser");function E3(t){const{app:e}=xh(),n=Rg(e);return p2(n,window.location.href)}async function I3(t){const{app:e}=xh(),n=Rg(e),r=Ng(e);await g2(n,VA);const i=t||window.localStorage.getItem("bb_magic_email")||"";if(!i)throw new Error("Email required to complete sign-in");const s=window.location.href,o=await m2(n,i,s);return window.localStorage.removeItem("bb_magic_email"),await Nh(r,"migrateCustomerForEmail")({email:i}),o.user}class T3{constructor(e,n){this.db=e,n&&typeof window<"u"&&(this.messaging=E1(n))}async sendMessage(e){const n={...e,timestamp:Dn(),read:!1};return(await Hd(Rt(this.db,"messages"),n)).id}async getMessages(e,n=50){const r=mn(Rt(this.db,"messages"),Ut("customerId","==",e),yi("timestamp","desc"),sA(n));return(await Qo(r)).docs.map(s=>({id:s.id,...s.data()}))}subscribeToMessages(e,n){const r=mn(Rt(this.db,"messages"),Ut("customerId","==",e),yi("timestamp","asc"));return Ha(r,i=>{const s=i.docs.map(o=>({id:o.id,...o.data()}));n(s)})}async markMessagesAsRead(e,n){const r=mn(Rt(this.db,"messages"),Ut("customerId","==",e),Ut("type","==","customer"),Ut("read","==",!1)),s=(await Qo(r)).docs.map(o=>zd(o.ref,{read:!0,readBy:n,readAt:Dn()}));await Promise.all(s)}async getConversations(){const e=mn(Rt(this.db,"conversations"),yi("lastMessageTime","desc"));return(await Qo(e)).docs.map(r=>({id:r.id,...r.data()}))}subscribeToConversations(e){const n=mn(Rt(this.db,"conversations"),yi("lastMessageTime","desc"));return Ha(n,r=>{const i=r.docs.map(s=>({id:s.id,...s.data()}));e(i)})}async updateConversation(e,n){const r=Gs(this.db,"conversations",e);await zd(r,{lastMessage:n.content,lastMessageTime:Dn(),unreadCount:n.type==="customer"?await this.getUnreadCount(e)+1:0,status:"active"}).catch(async()=>{await Hd(Rt(this.db,"conversations"),{customerId:e,customerName:n.customerName,customerEmail:n.customerEmail,lastMessage:n.content,lastMessageTime:Dn(),unreadCount:n.type==="customer"?1:0,status:"active",appointmentId:n.appointmentId})})}async getUnreadCount(e){const n=mn(Rt(this.db,"messages"),Ut("customerId","==",e),Ut("type","==","customer"),Ut("read","==",!1));return(await Qo(n)).size}async requestNotificationPermission(){if(!this.messaging)return null;try{if(await Notification.requestPermission()==="granted")return await wF(this.messaging,{vapidKey:void 0})}catch(e){console.error("Error getting FCM token:",e)}return null}onMessage(e){return this.messaging?EF(this.messaging,e):()=>{}}async saveCustomerToken(e,n){const r=Gs(this.db,"customer_tokens",e);await zd(r,{token:n,updatedAt:Dn()}).catch(async()=>{await Hd(Rt(this.db,"customer_tokens"),{customerId:e,token:n,createdAt:Dn(),updatedAt:Dn()})})}}const S3=t=>{if(!t)return"";const e=t.toDate?t.toDate():new Date(t),r=(new Date().getTime()-e.getTime())/(1e3*60*60);return r<1?"Just now":r<24?`${Math.floor(r)}h ago`:r<168?`${Math.floor(r/24)}d ago`:e.toLocaleDateString()};function A3({customerId:t,customerName:e,customerEmail:n,appointmentId:r,className:i=""}){const[s,o]=L.useState([]),[l,u]=L.useState(""),[c,d]=L.useState(null),[p,m]=L.useState(!0),[w,C]=L.useState(!1),P=L.useRef(null);L.useEffect(()=>{const{db:y,app:S}=Ug(),b=new T3(y,S);d(b),b.requestNotificationPermission().then(_=>{_&&b.saveCustomerToken(t,_)});const F=b.subscribeToMessages(t,_=>{o(_),m(!1)}),$=b.onMessage(_=>{console.log("Message received:",_)});return()=>{F(),$()}},[t]),L.useEffect(()=>{N()},[s]);const N=()=>{var y;(y=P.current)==null||y.scrollIntoView({behavior:"smooth"})},I=async()=>{if(!(!l.trim()||!c))try{await c.sendMessage({customerId:t,customerName:e,customerEmail:n,content:l.trim(),type:"customer",priority:"medium",appointmentId:r}),await c.updateConversation(t,{customerId:t,customerName:e,customerEmail:n,content:l.trim(),type:"customer",appointmentId:r}),u("")}catch(y){console.error("Error sending message:",y)}};return p?D.jsx("div",{className:`flex items-center justify-center h-32 ${i}`,children:D.jsx("div",{className:"animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"})}):D.jsxs("div",{className:`bg-white rounded-lg shadow-lg ${i}`,children:[D.jsx("div",{className:"p-4 bg-blue-600 text-white rounded-t-lg cursor-pointer",onClick:()=>C(!w),children:D.jsxs("div",{className:"flex justify-between items-center",children:[D.jsxs("div",{children:[D.jsx("h3",{className:"font-semibold",children:"Message Support"}),D.jsx("p",{className:"text-sm text-blue-100",children:"We're here to help!"})]}),D.jsxs("div",{className:"flex items-center space-x-2",children:[s.some(y=>y.type==="admin"&&!y.read)&&D.jsx("div",{className:"w-2 h-2 bg-red-400 rounded-full"}),D.jsx("svg",{className:`w-5 h-5 transform transition-transform ${w?"rotate-180":""}`,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:D.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]})]})}),!w&&D.jsxs(D.Fragment,{children:[D.jsxs("div",{className:"h-64 overflow-y-auto p-4 space-y-3",children:[s.length===0?D.jsxs("div",{className:"text-center text-gray-500 py-8",children:[D.jsx("svg",{className:"w-12 h-12 mx-auto mb-4 text-gray-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:D.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"})}),D.jsx("p",{children:"No messages yet. Start a conversation!"})]}):s.map(y=>D.jsx("div",{className:`flex ${y.type==="customer"?"justify-end":"justify-start"}`,children:D.jsxs("div",{className:`max-w-xs px-3 py-2 rounded-lg ${y.type==="customer"?"bg-blue-600 text-white":"bg-gray-200 text-gray-900"}`,children:[D.jsx("p",{className:"text-sm",children:y.content}),D.jsx("p",{className:`text-xs mt-1 ${y.type==="customer"?"text-blue-100":"text-gray-500"}`,children:S3(y.timestamp)})]})},y.id)),D.jsx("div",{ref:P})]}),D.jsxs("div",{className:"p-4 border-t border-gray-200",children:[D.jsxs("div",{className:"flex space-x-2",children:[D.jsx("input",{type:"text",value:l,onChange:y=>u(y.target.value),onKeyPress:y=>y.key==="Enter"&&I(),placeholder:"Type your message...",className:"flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"}),D.jsx("button",{onClick:I,disabled:!l.trim(),className:"px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm",children:"Send"})]}),D.jsx("p",{className:"text-xs text-gray-500 mt-2",children:"💡 Tip: Ask about appointments, services, or any questions you have!"})]})]})]})}function C3(){const{db:t}=Ug(),e=a0(),n=_3(),[r,i]=L.useState([]),[s,o]=L.useState(null);L.useEffect(()=>T1(t,{activeOnly:!0},i),[]),L.useEffect(()=>PF(t,o),[]);const[l,u]=L.useState(""),c=L.useMemo(()=>r.find(q=>q.id===l)||null,[r,l]),d=(c==null?void 0:c.duration)??60,[p,m]=L.useState(()=>new Date().toISOString().slice(0,10)),w=L.useMemo(()=>new Date(p+"T00:00:00"),[p]),[C,P]=L.useState([]);L.useEffect(()=>CF(t,w,P),[w]);const N=L.useMemo(()=>s&&c?RF(w,d,s,C).map(q=>({startISO:q,resourceId:null})):[],[s,c,d,C,w]),I=L.useMemo(DF,[]),[y,S]=L.useState(null),[b,F]=L.useState(null),[$,_]=L.useState(""),[v,E]=L.useState(""),T=L.useRef(null);L.useEffect(()=>{if(!b){T.current&&window.clearInterval(T.current),E("");return}const q=()=>{const Se=new Date(b.expiresAt).getTime()-Date.now();if(Se<=0){T.current&&window.clearInterval(T.current),E("0:00");return}const ho=Math.floor(Se/6e4),fo=Math.floor(Se%6e4/1e3).toString().padStart(2,"0");E(`${ho}:${fo}`)};return q(),T.current=window.setInterval(q,1e3),()=>{T.current&&window.clearInterval(T.current)}},[b]);async function k(q){if(_(""),S(q),b){try{await aE(b.id)}catch{}F(null)}try{const Se=await NF({serviceId:c.id,startISO:q.startISO,durationMinutes:d,sessionId:I,resourceId:q.resourceId??null});F({id:Se.id,expiresAt:Se.expiresAt})}catch(Se){_((Se==null?void 0:Se.message)==="E_OVERLAP"?"This time is no longer available.":(Se==null?void 0:Se.message)||"Failed to hold slot."),S(null)}}const[R,A]=L.useState(null);L.useEffect(()=>l6(n,A),[n]);const[ct,kn]=L.useState(!1),[Rn,Vt]=L.useState("");L.useEffect(()=>{const q=E3();if(kn(q),q){const Se=window.localStorage.getItem("bb_magic_email");Se&&Vt(Se)}},[]);const[B,Y]=L.useState(!1),[J,ge]=L.useState(""),[re,Te]=L.useState(""),[Pt,Qt]=L.useState("");async function Yt(){if(R!=null&&R.email){const q=await sE(t,R.email);return q?q.id:await iE(t,{name:R.displayName||"Customer",email:R.email,phone:null,status:"approved"})}if(re){const q=await sE(t,re);return q?q.id:await iE(t,{name:J||"Guest",email:re,phone:Pt||null,status:"guest"})}throw new Error("Missing customer email.")}async function Ft(){if(!(!b||!c||!y)){_("");try{!R&&ct&&Rn&&(await I3(Rn),window.history.replaceState({},document.title,window.location.pathname));const q=await Yt(),Se=await OF({holdId:b.id,customerId:q,customer:{name:(R==null?void 0:R.displayName)||J||null,email:(R==null?void 0:R.email)||re||null,phone:Pt||null},price:c.price,autoConfirm:!0});e(`/confirmation?id=${encodeURIComponent(Se.appointmentId)}`)}catch(q){_((q==null?void 0:q.message)==="E_OVERLAP"?"This time is no longer available.":(q==null?void 0:q.message)||"Failed to finalize booking.");try{b&&await aE(b.id)}catch{}F(null)}}}const Tl=q=>F4($4(q),"h:mm a"),ri=b?new Date(b.expiresAt).getTime()<=Date.now():!1;return D.jsxs("div",{className:"relative",children:[D.jsxs("section",{className:"grid gap-6",children:[D.jsx("h1",{className:"font-serif text-2xl",children:"Book an appointment"}),D.jsxs("div",{className:"rounded-xl bg-white p-4 shadow-soft",children:[D.jsx("h2",{className:"mb-2 font-medium",children:"1. Choose a service"}),D.jsx("div",{className:"grid gap-3 sm:grid-cols-2 lg:grid-cols-3",children:r.map(q=>D.jsx("label",{className:`cursor-pointer rounded-lg border p-3 ${l===q.id?"ring-2 ring-terracotta":"hover:bg-cream"}`,children:D.jsxs("div",{className:"flex items-center justify-between",children:[D.jsxs("div",{children:[D.jsx("div",{className:"font-medium",children:q.name}),D.jsxs("div",{className:"text-xs text-slate-500",children:[q.duration,"m · $",q.price.toFixed(2)]})]}),D.jsx("input",{type:"radio",name:"svc",checked:l===q.id,onChange:()=>{u(q.id),S(null),F(null),_("")}})]})},q.id))})]}),D.jsxs("div",{className:"rounded-xl bg-white p-4 shadow-soft",children:[D.jsx("h2",{className:"mb-2 font-medium",children:"2. Pick date & time"}),D.jsxs("div",{className:"mb-3 flex flex-wrap items-center gap-3",children:[D.jsxs("label",{className:"text-sm text-slate-600",children:["Date",D.jsx("input",{type:"date",className:"ml-2 rounded-md border p-2",value:p,onChange:q=>{m(q.target.value),S(null),b&&F(null),_("")}})]}),c&&D.jsxs("div",{className:"text-sm text-slate-600",children:["Duration: ",d," min"]})]}),D.jsxs("div",{className:"grid grid-cols-4 gap-2",children:[N.map(q=>D.jsx("button",{onClick:()=>k(q),className:`rounded-md border py-2 text-sm ${(y==null?void 0:y.startISO)===q.startISO?"bg-terracotta text-white":"hover:bg-cream"}`,children:Tl(q.startISO)},q.startISO)),!N.length&&D.jsx("div",{className:"col-span-4 text-sm text-slate-500",children:"No slots available under current business hours."})]}),y&&c&&D.jsxs("div",{className:"mt-4 rounded-2xl border border-terracotta/40 bg-cream/60 p-4",children:[D.jsxs("div",{className:"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",children:[D.jsxs("div",{children:[D.jsx("div",{className:"text-sm text-slate-600",children:"You’re holding"}),D.jsxs("div",{className:"font-serif text-lg",children:[c.name," • ",Tl(y.startISO)]}),D.jsx("div",{className:`text-xs ${ri?"text-red-600":"text-slate-500"}`,children:b?ri?"Hold expired":`Hold expires in ${v}`:"Creating hold…"})]}),D.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row sm:items-center",children:[!R&&ct&&D.jsx("input",{className:"w-56 rounded-md border p-2",placeholder:"your@email.com",value:Rn,onChange:q=>Vt(q.target.value),inputMode:"email",autoComplete:"email","aria-label":"Email for verification"}),D.jsx("button",{className:"rounded-xl bg-terracotta px-4 py-2 text-white disabled:opacity-60",onClick:()=>void Ft(),disabled:!b||ri,children:"Book now"}),D.jsx("button",{className:"rounded-xl border border-terracotta/60 px-4 py-2 text-terracotta disabled:opacity-60",onClick:()=>Y(q=>!q),disabled:!b||ri,children:"Book as guest"})]})]}),B&&b&&!ri&&D.jsxs("div",{className:"mt-3 grid gap-2 sm:grid-cols-3",children:[D.jsx("input",{className:"rounded-md border p-2",placeholder:"Full name",value:J,onChange:q=>ge(q.target.value)}),D.jsx("input",{className:"rounded-md border p-2",placeholder:"Email",value:re,onChange:q=>Te(q.target.value),inputMode:"email",autoComplete:"email"}),D.jsx("input",{className:"rounded-md border p-2",placeholder:"Phone",value:Pt,onChange:q=>Qt(q.target.value),inputMode:"tel",autoComplete:"tel"}),D.jsx("div",{className:"sm:col-span-3 flex justify-end",children:D.jsx("button",{className:"rounded-md bg-terracotta px-4 py-2 text-white disabled:opacity-60",onClick:()=>void Ft(),disabled:!J||!re,children:"Confirm guest booking"})})]})]})]}),$&&D.jsx("div",{className:"text-sm text-red-600",role:"alert","aria-live":"polite",children:$})]}),D.jsx("div",{className:"fixed bottom-4 right-4 w-80 z-50",children:D.jsx(A3,{customerId:(R==null?void 0:R.uid)||re||"guest",customerName:(R==null?void 0:R.displayName)||J||"Guest",customerEmail:(R==null?void 0:R.email)||re||"",appointmentId:b==null?void 0:b.id})})]})}function P3(){const{state:t}=to();return D.jsxs("section",{className:"grid gap-2",children:[D.jsx("h2",{className:"text-2xl font-serif text-green-700",children:"Confirmed!"}),D.jsxs("p",{children:["Your appointment is booked",t!=null&&t.serviceName?` for ${t.serviceName}`:"",t!=null&&t.when?` at ${t.when}`:"","."]}),D.jsx("p",{children:"We emailed your details and attached a calendar file (.ics)."}),D.jsx(js,{to:"/",className:"text-terracotta underline",children:"Back to home"})]})}function k3(){return D.jsxs("div",{className:"min-h-screen bg-cream text-slate-800",children:[D.jsx(SF,{}),D.jsx("main",{className:"max-w-6xl mx-auto p-6",children:D.jsxs(hb,{children:[D.jsx(Bo,{path:"/",element:D.jsx(AF,{})}),D.jsx(Bo,{path:"/services",element:D.jsx(kF,{})}),D.jsx(Bo,{path:"/book",element:D.jsx(C3,{})}),D.jsx(Bo,{path:"/confirmation",element:D.jsx(P3,{})})]})}),D.jsx("footer",{className:"border-t bg-white/60 mt-12",children:D.jsxs("div",{className:"max-w-6xl mx-auto p-6 text-xs text-slate-600",children:["© ",new Date().getFullYear()," BUENO BROWS"]})})]})}of.createRoot(document.getElementById("root")).render(D.jsx(QE.StrictMode,{children:D.jsx(TF,{children:D.jsx(_b,{children:D.jsx(k3,{})})})}));
