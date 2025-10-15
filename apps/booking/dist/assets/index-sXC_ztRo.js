function eS(t,e){for(var n=0;n<e.length;n++){const r=e[n];if(typeof r!="string"&&!Array.isArray(r)){for(const s in r)if(s!=="default"&&!(s in t)){const i=Object.getOwnPropertyDescriptor(r,s);i&&Object.defineProperty(t,s,i.get?i:{enumerable:!0,get:()=>r[s]})}}}return Object.freeze(Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}))}(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();function tS(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var I0={exports:{}},vc={},S0={exports:{}},re={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var za=Symbol.for("react.element"),nS=Symbol.for("react.portal"),rS=Symbol.for("react.fragment"),sS=Symbol.for("react.strict_mode"),iS=Symbol.for("react.profiler"),oS=Symbol.for("react.provider"),aS=Symbol.for("react.context"),lS=Symbol.for("react.forward_ref"),uS=Symbol.for("react.suspense"),cS=Symbol.for("react.memo"),dS=Symbol.for("react.lazy"),sy=Symbol.iterator;function hS(t){return t===null||typeof t!="object"?null:(t=sy&&t[sy]||t["@@iterator"],typeof t=="function"?t:null)}var A0={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},k0=Object.assign,b0={};function Yi(t,e,n){this.props=t,this.context=e,this.refs=b0,this.updater=n||A0}Yi.prototype.isReactComponent={};Yi.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Yi.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function C0(){}C0.prototype=Yi.prototype;function sp(t,e,n){this.props=t,this.context=e,this.refs=b0,this.updater=n||A0}var ip=sp.prototype=new C0;ip.constructor=sp;k0(ip,Yi.prototype);ip.isPureReactComponent=!0;var iy=Array.isArray,N0=Object.prototype.hasOwnProperty,op={current:null},R0={key:!0,ref:!0,__self:!0,__source:!0};function P0(t,e,n){var r,s={},i=null,o=null;if(e!=null)for(r in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(i=""+e.key),e)N0.call(e,r)&&!R0.hasOwnProperty(r)&&(s[r]=e[r]);var l=arguments.length-2;if(l===1)s.children=n;else if(1<l){for(var u=Array(l),c=0;c<l;c++)u[c]=arguments[c+2];s.children=u}if(t&&t.defaultProps)for(r in l=t.defaultProps,l)s[r]===void 0&&(s[r]=l[r]);return{$$typeof:za,type:t,key:i,ref:o,props:s,_owner:op.current}}function fS(t,e){return{$$typeof:za,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function ap(t){return typeof t=="object"&&t!==null&&t.$$typeof===za}function pS(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var oy=/\/+/g;function jd(t,e){return typeof t=="object"&&t!==null&&t.key!=null?pS(""+t.key):e.toString(36)}function Zl(t,e,n,r,s){var i=typeof t;(i==="undefined"||i==="boolean")&&(t=null);var o=!1;if(t===null)o=!0;else switch(i){case"string":case"number":o=!0;break;case"object":switch(t.$$typeof){case za:case nS:o=!0}}if(o)return o=t,s=s(o),t=r===""?"."+jd(o,0):r,iy(s)?(n="",t!=null&&(n=t.replace(oy,"$&/")+"/"),Zl(s,e,n,"",function(c){return c})):s!=null&&(ap(s)&&(s=fS(s,n+(!s.key||o&&o.key===s.key?"":(""+s.key).replace(oy,"$&/")+"/")+t)),e.push(s)),1;if(o=0,r=r===""?".":r+":",iy(t))for(var l=0;l<t.length;l++){i=t[l];var u=r+jd(i,l);o+=Zl(i,e,n,u,s)}else if(u=hS(t),typeof u=="function")for(t=u.call(t),l=0;!(i=t.next()).done;)i=i.value,u=r+jd(i,l++),o+=Zl(i,e,n,u,s);else if(i==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function Al(t,e,n){if(t==null)return t;var r=[],s=0;return Zl(t,r,"","",function(i){return e.call(n,i,s++)}),r}function mS(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var It={current:null},eu={transition:null},gS={ReactCurrentDispatcher:It,ReactCurrentBatchConfig:eu,ReactCurrentOwner:op};function D0(){throw Error("act(...) is not supported in production builds of React.")}re.Children={map:Al,forEach:function(t,e,n){Al(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Al(t,function(){e++}),e},toArray:function(t){return Al(t,function(e){return e})||[]},only:function(t){if(!ap(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};re.Component=Yi;re.Fragment=rS;re.Profiler=iS;re.PureComponent=sp;re.StrictMode=sS;re.Suspense=uS;re.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=gS;re.act=D0;re.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var r=k0({},t.props),s=t.key,i=t.ref,o=t._owner;if(e!=null){if(e.ref!==void 0&&(i=e.ref,o=op.current),e.key!==void 0&&(s=""+e.key),t.type&&t.type.defaultProps)var l=t.type.defaultProps;for(u in e)N0.call(e,u)&&!R0.hasOwnProperty(u)&&(r[u]=e[u]===void 0&&l!==void 0?l[u]:e[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){l=Array(u);for(var c=0;c<u;c++)l[c]=arguments[c+2];r.children=l}return{$$typeof:za,type:t.type,key:s,ref:i,props:r,_owner:o}};re.createContext=function(t){return t={$$typeof:aS,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:oS,_context:t},t.Consumer=t};re.createElement=P0;re.createFactory=function(t){var e=P0.bind(null,t);return e.type=t,e};re.createRef=function(){return{current:null}};re.forwardRef=function(t){return{$$typeof:lS,render:t}};re.isValidElement=ap;re.lazy=function(t){return{$$typeof:dS,_payload:{_status:-1,_result:t},_init:mS}};re.memo=function(t,e){return{$$typeof:cS,type:t,compare:e===void 0?null:e}};re.startTransition=function(t){var e=eu.transition;eu.transition={};try{t()}finally{eu.transition=e}};re.unstable_act=D0;re.useCallback=function(t,e){return It.current.useCallback(t,e)};re.useContext=function(t){return It.current.useContext(t)};re.useDebugValue=function(){};re.useDeferredValue=function(t){return It.current.useDeferredValue(t)};re.useEffect=function(t,e){return It.current.useEffect(t,e)};re.useId=function(){return It.current.useId()};re.useImperativeHandle=function(t,e,n){return It.current.useImperativeHandle(t,e,n)};re.useInsertionEffect=function(t,e){return It.current.useInsertionEffect(t,e)};re.useLayoutEffect=function(t,e){return It.current.useLayoutEffect(t,e)};re.useMemo=function(t,e){return It.current.useMemo(t,e)};re.useReducer=function(t,e,n){return It.current.useReducer(t,e,n)};re.useRef=function(t){return It.current.useRef(t)};re.useState=function(t){return It.current.useState(t)};re.useSyncExternalStore=function(t,e,n){return It.current.useSyncExternalStore(t,e,n)};re.useTransition=function(){return It.current.useTransition()};re.version="18.3.1";S0.exports=re;var D=S0.exports;const O0=tS(D),yS=eS({__proto__:null,default:O0},[D]);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var vS=D,_S=Symbol.for("react.element"),wS=Symbol.for("react.fragment"),ES=Object.prototype.hasOwnProperty,TS=vS.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,xS={key:!0,ref:!0,__self:!0,__source:!0};function M0(t,e,n){var r,s={},i=null,o=null;n!==void 0&&(i=""+n),e.key!==void 0&&(i=""+e.key),e.ref!==void 0&&(o=e.ref);for(r in e)ES.call(e,r)&&!xS.hasOwnProperty(r)&&(s[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)s[r]===void 0&&(s[r]=e[r]);return{$$typeof:_S,type:t,key:i,ref:o,props:s,_owner:TS.current}}vc.Fragment=wS;vc.jsx=M0;vc.jsxs=M0;I0.exports=vc;var d=I0.exports,Nh={},j0={exports:{}},Wt={},L0={exports:{}},V0={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(z,Q){var Z=z.length;z.push(Q);e:for(;0<Z;){var pe=Z-1>>>1,oe=z[pe];if(0<s(oe,Q))z[pe]=Q,z[Z]=oe,Z=pe;else break e}}function n(z){return z.length===0?null:z[0]}function r(z){if(z.length===0)return null;var Q=z[0],Z=z.pop();if(Z!==Q){z[0]=Z;e:for(var pe=0,oe=z.length,xe=oe>>>1;pe<xe;){var He=2*(pe+1)-1,sn=z[He],nt=He+1,on=z[nt];if(0>s(sn,Z))nt<oe&&0>s(on,sn)?(z[pe]=on,z[nt]=Z,pe=nt):(z[pe]=sn,z[He]=Z,pe=He);else if(nt<oe&&0>s(on,Z))z[pe]=on,z[nt]=Z,pe=nt;else break e}}return Q}function s(z,Q){var Z=z.sortIndex-Q.sortIndex;return Z!==0?Z:z.id-Q.id}if(typeof performance=="object"&&typeof performance.now=="function"){var i=performance;t.unstable_now=function(){return i.now()}}else{var o=Date,l=o.now();t.unstable_now=function(){return o.now()-l}}var u=[],c=[],f=1,m=null,g=3,x=!1,A=!1,C=!1,N=typeof setTimeout=="function"?setTimeout:null,E=typeof clearTimeout=="function"?clearTimeout:null,y=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function _(z){for(var Q=n(c);Q!==null;){if(Q.callback===null)r(c);else if(Q.startTime<=z)r(c),Q.sortIndex=Q.expirationTime,e(u,Q);else break;Q=n(c)}}function R(z){if(C=!1,_(z),!A)if(n(u)!==null)A=!0,rn(V);else{var Q=n(c);Q!==null&&At(R,Q.startTime-z)}}function V(z,Q){A=!1,C&&(C=!1,E(w),w=-1),x=!0;var Z=g;try{for(_(Q),m=n(u);m!==null&&(!(m.expirationTime>Q)||z&&!b());){var pe=m.callback;if(typeof pe=="function"){m.callback=null,g=m.priorityLevel;var oe=pe(m.expirationTime<=Q);Q=t.unstable_now(),typeof oe=="function"?m.callback=oe:m===n(u)&&r(u),_(Q)}else r(u);m=n(u)}if(m!==null)var xe=!0;else{var He=n(c);He!==null&&At(R,He.startTime-Q),xe=!1}return xe}finally{m=null,g=Z,x=!1}}var j=!1,I=null,w=-1,S=5,T=-1;function b(){return!(t.unstable_now()-T<S)}function P(){if(I!==null){var z=t.unstable_now();T=z;var Q=!0;try{Q=I(!0,z)}finally{Q?k():(j=!1,I=null)}}else j=!1}var k;if(typeof y=="function")k=function(){y(P)};else if(typeof MessageChannel<"u"){var J=new MessageChannel,yt=J.port2;J.port1.onmessage=P,k=function(){yt.postMessage(null)}}else k=function(){N(P,0)};function rn(z){I=z,j||(j=!0,k())}function At(z,Q){w=N(function(){z(t.unstable_now())},Q)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(z){z.callback=null},t.unstable_continueExecution=function(){A||x||(A=!0,rn(V))},t.unstable_forceFrameRate=function(z){0>z||125<z?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):S=0<z?Math.floor(1e3/z):5},t.unstable_getCurrentPriorityLevel=function(){return g},t.unstable_getFirstCallbackNode=function(){return n(u)},t.unstable_next=function(z){switch(g){case 1:case 2:case 3:var Q=3;break;default:Q=g}var Z=g;g=Q;try{return z()}finally{g=Z}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(z,Q){switch(z){case 1:case 2:case 3:case 4:case 5:break;default:z=3}var Z=g;g=z;try{return Q()}finally{g=Z}},t.unstable_scheduleCallback=function(z,Q,Z){var pe=t.unstable_now();switch(typeof Z=="object"&&Z!==null?(Z=Z.delay,Z=typeof Z=="number"&&0<Z?pe+Z:pe):Z=pe,z){case 1:var oe=-1;break;case 2:oe=250;break;case 5:oe=1073741823;break;case 4:oe=1e4;break;default:oe=5e3}return oe=Z+oe,z={id:f++,callback:Q,priorityLevel:z,startTime:Z,expirationTime:oe,sortIndex:-1},Z>pe?(z.sortIndex=Z,e(c,z),n(u)===null&&z===n(c)&&(C?(E(w),w=-1):C=!0,At(R,Z-pe))):(z.sortIndex=oe,e(u,z),A||x||(A=!0,rn(V))),z},t.unstable_shouldYield=b,t.unstable_wrapCallback=function(z){var Q=g;return function(){var Z=g;g=Q;try{return z.apply(this,arguments)}finally{g=Z}}}})(V0);L0.exports=V0;var IS=L0.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var SS=D,$t=IS;function U(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var F0=new Set,ca={};function Hs(t,e){Oi(t,e),Oi(t+"Capture",e)}function Oi(t,e){for(ca[t]=e,t=0;t<e.length;t++)F0.add(e[t])}var Xn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Rh=Object.prototype.hasOwnProperty,AS=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,ay={},ly={};function kS(t){return Rh.call(ly,t)?!0:Rh.call(ay,t)?!1:AS.test(t)?ly[t]=!0:(ay[t]=!0,!1)}function bS(t,e,n,r){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function CS(t,e,n,r){if(e===null||typeof e>"u"||bS(t,e,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function St(t,e,n,r,s,i,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=r,this.attributeNamespace=s,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=i,this.removeEmptyString=o}var et={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){et[t]=new St(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];et[e]=new St(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){et[t]=new St(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){et[t]=new St(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){et[t]=new St(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){et[t]=new St(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){et[t]=new St(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){et[t]=new St(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){et[t]=new St(t,5,!1,t.toLowerCase(),null,!1,!1)});var lp=/[\-:]([a-z])/g;function up(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(lp,up);et[e]=new St(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(lp,up);et[e]=new St(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(lp,up);et[e]=new St(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){et[t]=new St(t,1,!1,t.toLowerCase(),null,!1,!1)});et.xlinkHref=new St("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){et[t]=new St(t,1,!1,t.toLowerCase(),null,!0,!0)});function cp(t,e,n,r){var s=et.hasOwnProperty(e)?et[e]:null;(s!==null?s.type!==0:r||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(CS(e,n,s,r)&&(n=null),r||s===null?kS(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):s.mustUseProperty?t[s.propertyName]=n===null?s.type===3?!1:"":n:(e=s.attributeName,r=s.attributeNamespace,n===null?t.removeAttribute(e):(s=s.type,n=s===3||s===4&&n===!0?"":""+n,r?t.setAttributeNS(r,e,n):t.setAttribute(e,n))))}var ir=SS.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,kl=Symbol.for("react.element"),di=Symbol.for("react.portal"),hi=Symbol.for("react.fragment"),dp=Symbol.for("react.strict_mode"),Ph=Symbol.for("react.profiler"),U0=Symbol.for("react.provider"),B0=Symbol.for("react.context"),hp=Symbol.for("react.forward_ref"),Dh=Symbol.for("react.suspense"),Oh=Symbol.for("react.suspense_list"),fp=Symbol.for("react.memo"),gr=Symbol.for("react.lazy"),$0=Symbol.for("react.offscreen"),uy=Symbol.iterator;function Io(t){return t===null||typeof t!="object"?null:(t=uy&&t[uy]||t["@@iterator"],typeof t=="function"?t:null)}var Ae=Object.assign,Ld;function Lo(t){if(Ld===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Ld=e&&e[1]||""}return`
`+Ld+t}var Vd=!1;function Fd(t,e){if(!t||Vd)return"";Vd=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var r=c}Reflect.construct(t,[],e)}else{try{e.call()}catch(c){r=c}t.call(e.prototype)}else{try{throw Error()}catch(c){r=c}t()}}catch(c){if(c&&r&&typeof c.stack=="string"){for(var s=c.stack.split(`
`),i=r.stack.split(`
`),o=s.length-1,l=i.length-1;1<=o&&0<=l&&s[o]!==i[l];)l--;for(;1<=o&&0<=l;o--,l--)if(s[o]!==i[l]){if(o!==1||l!==1)do if(o--,l--,0>l||s[o]!==i[l]){var u=`
`+s[o].replace(" at new "," at ");return t.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",t.displayName)),u}while(1<=o&&0<=l);break}}}finally{Vd=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?Lo(t):""}function NS(t){switch(t.tag){case 5:return Lo(t.type);case 16:return Lo("Lazy");case 13:return Lo("Suspense");case 19:return Lo("SuspenseList");case 0:case 2:case 15:return t=Fd(t.type,!1),t;case 11:return t=Fd(t.type.render,!1),t;case 1:return t=Fd(t.type,!0),t;default:return""}}function Mh(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case hi:return"Fragment";case di:return"Portal";case Ph:return"Profiler";case dp:return"StrictMode";case Dh:return"Suspense";case Oh:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case B0:return(t.displayName||"Context")+".Consumer";case U0:return(t._context.displayName||"Context")+".Provider";case hp:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case fp:return e=t.displayName||null,e!==null?e:Mh(t.type)||"Memo";case gr:e=t._payload,t=t._init;try{return Mh(t(e))}catch{}}return null}function RS(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Mh(e);case 8:return e===dp?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function $r(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function z0(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function PS(t){var e=z0(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),r=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var s=n.get,i=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return s.call(this)},set:function(o){r=""+o,i.call(this,o)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function bl(t){t._valueTracker||(t._valueTracker=PS(t))}function W0(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=z0(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function xu(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function jh(t,e){var n=e.checked;return Ae({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function cy(t,e){var n=e.defaultValue==null?"":e.defaultValue,r=e.checked!=null?e.checked:e.defaultChecked;n=$r(e.value!=null?e.value:n),t._wrapperState={initialChecked:r,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function H0(t,e){e=e.checked,e!=null&&cp(t,"checked",e,!1)}function Lh(t,e){H0(t,e);var n=$r(e.value),r=e.type;if(n!=null)r==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(r==="submit"||r==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?Vh(t,e.type,n):e.hasOwnProperty("defaultValue")&&Vh(t,e.type,$r(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function dy(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var r=e.type;if(!(r!=="submit"&&r!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function Vh(t,e,n){(e!=="number"||xu(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var Vo=Array.isArray;function xi(t,e,n,r){if(t=t.options,e){e={};for(var s=0;s<n.length;s++)e["$"+n[s]]=!0;for(n=0;n<t.length;n++)s=e.hasOwnProperty("$"+t[n].value),t[n].selected!==s&&(t[n].selected=s),s&&r&&(t[n].defaultSelected=!0)}else{for(n=""+$r(n),e=null,s=0;s<t.length;s++){if(t[s].value===n){t[s].selected=!0,r&&(t[s].defaultSelected=!0);return}e!==null||t[s].disabled||(e=t[s])}e!==null&&(e.selected=!0)}}function Fh(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(U(91));return Ae({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function hy(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(U(92));if(Vo(n)){if(1<n.length)throw Error(U(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:$r(n)}}function q0(t,e){var n=$r(e.value),r=$r(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),r!=null&&(t.defaultValue=""+r)}function fy(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function G0(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Uh(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?G0(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Cl,K0=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,r,s){MSApp.execUnsafeLocalFunction(function(){return t(e,n,r,s)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Cl=Cl||document.createElement("div"),Cl.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Cl.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function da(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var Ko={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},DS=["Webkit","ms","Moz","O"];Object.keys(Ko).forEach(function(t){DS.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),Ko[e]=Ko[t]})});function Q0(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||Ko.hasOwnProperty(t)&&Ko[t]?(""+e).trim():e+"px"}function Y0(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var r=n.indexOf("--")===0,s=Q0(n,e[n],r);n==="float"&&(n="cssFloat"),r?t.setProperty(n,s):t[n]=s}}var OS=Ae({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Bh(t,e){if(e){if(OS[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(U(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(U(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(U(61))}if(e.style!=null&&typeof e.style!="object")throw Error(U(62))}}function $h(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var zh=null;function pp(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Wh=null,Ii=null,Si=null;function py(t){if(t=qa(t)){if(typeof Wh!="function")throw Error(U(280));var e=t.stateNode;e&&(e=xc(e),Wh(t.stateNode,t.type,e))}}function X0(t){Ii?Si?Si.push(t):Si=[t]:Ii=t}function J0(){if(Ii){var t=Ii,e=Si;if(Si=Ii=null,py(t),e)for(t=0;t<e.length;t++)py(e[t])}}function Z0(t,e){return t(e)}function ew(){}var Ud=!1;function tw(t,e,n){if(Ud)return t(e,n);Ud=!0;try{return Z0(t,e,n)}finally{Ud=!1,(Ii!==null||Si!==null)&&(ew(),J0())}}function ha(t,e){var n=t.stateNode;if(n===null)return null;var r=xc(n);if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(U(231,e,typeof n));return n}var Hh=!1;if(Xn)try{var So={};Object.defineProperty(So,"passive",{get:function(){Hh=!0}}),window.addEventListener("test",So,So),window.removeEventListener("test",So,So)}catch{Hh=!1}function MS(t,e,n,r,s,i,o,l,u){var c=Array.prototype.slice.call(arguments,3);try{e.apply(n,c)}catch(f){this.onError(f)}}var Qo=!1,Iu=null,Su=!1,qh=null,jS={onError:function(t){Qo=!0,Iu=t}};function LS(t,e,n,r,s,i,o,l,u){Qo=!1,Iu=null,MS.apply(jS,arguments)}function VS(t,e,n,r,s,i,o,l,u){if(LS.apply(this,arguments),Qo){if(Qo){var c=Iu;Qo=!1,Iu=null}else throw Error(U(198));Su||(Su=!0,qh=c)}}function qs(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function nw(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function my(t){if(qs(t)!==t)throw Error(U(188))}function FS(t){var e=t.alternate;if(!e){if(e=qs(t),e===null)throw Error(U(188));return e!==t?null:t}for(var n=t,r=e;;){var s=n.return;if(s===null)break;var i=s.alternate;if(i===null){if(r=s.return,r!==null){n=r;continue}break}if(s.child===i.child){for(i=s.child;i;){if(i===n)return my(s),t;if(i===r)return my(s),e;i=i.sibling}throw Error(U(188))}if(n.return!==r.return)n=s,r=i;else{for(var o=!1,l=s.child;l;){if(l===n){o=!0,n=s,r=i;break}if(l===r){o=!0,r=s,n=i;break}l=l.sibling}if(!o){for(l=i.child;l;){if(l===n){o=!0,n=i,r=s;break}if(l===r){o=!0,r=i,n=s;break}l=l.sibling}if(!o)throw Error(U(189))}}if(n.alternate!==r)throw Error(U(190))}if(n.tag!==3)throw Error(U(188));return n.stateNode.current===n?t:e}function rw(t){return t=FS(t),t!==null?sw(t):null}function sw(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=sw(t);if(e!==null)return e;t=t.sibling}return null}var iw=$t.unstable_scheduleCallback,gy=$t.unstable_cancelCallback,US=$t.unstable_shouldYield,BS=$t.unstable_requestPaint,Oe=$t.unstable_now,$S=$t.unstable_getCurrentPriorityLevel,mp=$t.unstable_ImmediatePriority,ow=$t.unstable_UserBlockingPriority,Au=$t.unstable_NormalPriority,zS=$t.unstable_LowPriority,aw=$t.unstable_IdlePriority,_c=null,An=null;function WS(t){if(An&&typeof An.onCommitFiberRoot=="function")try{An.onCommitFiberRoot(_c,t,void 0,(t.current.flags&128)===128)}catch{}}var fn=Math.clz32?Math.clz32:GS,HS=Math.log,qS=Math.LN2;function GS(t){return t>>>=0,t===0?32:31-(HS(t)/qS|0)|0}var Nl=64,Rl=4194304;function Fo(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function ku(t,e){var n=t.pendingLanes;if(n===0)return 0;var r=0,s=t.suspendedLanes,i=t.pingedLanes,o=n&268435455;if(o!==0){var l=o&~s;l!==0?r=Fo(l):(i&=o,i!==0&&(r=Fo(i)))}else o=n&~s,o!==0?r=Fo(o):i!==0&&(r=Fo(i));if(r===0)return 0;if(e!==0&&e!==r&&!(e&s)&&(s=r&-r,i=e&-e,s>=i||s===16&&(i&4194240)!==0))return e;if(r&4&&(r|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=r;0<e;)n=31-fn(e),s=1<<n,r|=t[n],e&=~s;return r}function KS(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function QS(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,s=t.expirationTimes,i=t.pendingLanes;0<i;){var o=31-fn(i),l=1<<o,u=s[o];u===-1?(!(l&n)||l&r)&&(s[o]=KS(l,e)):u<=e&&(t.expiredLanes|=l),i&=~l}}function Gh(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function lw(){var t=Nl;return Nl<<=1,!(Nl&4194240)&&(Nl=64),t}function Bd(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Wa(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-fn(e),t[e]=n}function YS(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var r=t.eventTimes;for(t=t.expirationTimes;0<n;){var s=31-fn(n),i=1<<s;e[s]=0,r[s]=-1,t[s]=-1,n&=~i}}function gp(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-fn(n),s=1<<r;s&e|t[r]&e&&(t[r]|=e),n&=~s}}var fe=0;function uw(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var cw,yp,dw,hw,fw,Kh=!1,Pl=[],Cr=null,Nr=null,Rr=null,fa=new Map,pa=new Map,_r=[],XS="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function yy(t,e){switch(t){case"focusin":case"focusout":Cr=null;break;case"dragenter":case"dragleave":Nr=null;break;case"mouseover":case"mouseout":Rr=null;break;case"pointerover":case"pointerout":fa.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":pa.delete(e.pointerId)}}function Ao(t,e,n,r,s,i){return t===null||t.nativeEvent!==i?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:i,targetContainers:[s]},e!==null&&(e=qa(e),e!==null&&yp(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,s!==null&&e.indexOf(s)===-1&&e.push(s),t)}function JS(t,e,n,r,s){switch(e){case"focusin":return Cr=Ao(Cr,t,e,n,r,s),!0;case"dragenter":return Nr=Ao(Nr,t,e,n,r,s),!0;case"mouseover":return Rr=Ao(Rr,t,e,n,r,s),!0;case"pointerover":var i=s.pointerId;return fa.set(i,Ao(fa.get(i)||null,t,e,n,r,s)),!0;case"gotpointercapture":return i=s.pointerId,pa.set(i,Ao(pa.get(i)||null,t,e,n,r,s)),!0}return!1}function pw(t){var e=vs(t.target);if(e!==null){var n=qs(e);if(n!==null){if(e=n.tag,e===13){if(e=nw(n),e!==null){t.blockedOn=e,fw(t.priority,function(){dw(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function tu(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Qh(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);zh=r,n.target.dispatchEvent(r),zh=null}else return e=qa(n),e!==null&&yp(e),t.blockedOn=n,!1;e.shift()}return!0}function vy(t,e,n){tu(t)&&n.delete(e)}function ZS(){Kh=!1,Cr!==null&&tu(Cr)&&(Cr=null),Nr!==null&&tu(Nr)&&(Nr=null),Rr!==null&&tu(Rr)&&(Rr=null),fa.forEach(vy),pa.forEach(vy)}function ko(t,e){t.blockedOn===e&&(t.blockedOn=null,Kh||(Kh=!0,$t.unstable_scheduleCallback($t.unstable_NormalPriority,ZS)))}function ma(t){function e(s){return ko(s,t)}if(0<Pl.length){ko(Pl[0],t);for(var n=1;n<Pl.length;n++){var r=Pl[n];r.blockedOn===t&&(r.blockedOn=null)}}for(Cr!==null&&ko(Cr,t),Nr!==null&&ko(Nr,t),Rr!==null&&ko(Rr,t),fa.forEach(e),pa.forEach(e),n=0;n<_r.length;n++)r=_r[n],r.blockedOn===t&&(r.blockedOn=null);for(;0<_r.length&&(n=_r[0],n.blockedOn===null);)pw(n),n.blockedOn===null&&_r.shift()}var Ai=ir.ReactCurrentBatchConfig,bu=!0;function eA(t,e,n,r){var s=fe,i=Ai.transition;Ai.transition=null;try{fe=1,vp(t,e,n,r)}finally{fe=s,Ai.transition=i}}function tA(t,e,n,r){var s=fe,i=Ai.transition;Ai.transition=null;try{fe=4,vp(t,e,n,r)}finally{fe=s,Ai.transition=i}}function vp(t,e,n,r){if(bu){var s=Qh(t,e,n,r);if(s===null)Xd(t,e,r,Cu,n),yy(t,r);else if(JS(s,t,e,n,r))r.stopPropagation();else if(yy(t,r),e&4&&-1<XS.indexOf(t)){for(;s!==null;){var i=qa(s);if(i!==null&&cw(i),i=Qh(t,e,n,r),i===null&&Xd(t,e,r,Cu,n),i===s)break;s=i}s!==null&&r.stopPropagation()}else Xd(t,e,r,null,n)}}var Cu=null;function Qh(t,e,n,r){if(Cu=null,t=pp(r),t=vs(t),t!==null)if(e=qs(t),e===null)t=null;else if(n=e.tag,n===13){if(t=nw(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return Cu=t,null}function mw(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch($S()){case mp:return 1;case ow:return 4;case Au:case zS:return 16;case aw:return 536870912;default:return 16}default:return 16}}var Sr=null,_p=null,nu=null;function gw(){if(nu)return nu;var t,e=_p,n=e.length,r,s="value"in Sr?Sr.value:Sr.textContent,i=s.length;for(t=0;t<n&&e[t]===s[t];t++);var o=n-t;for(r=1;r<=o&&e[n-r]===s[i-r];r++);return nu=s.slice(t,1<r?1-r:void 0)}function ru(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Dl(){return!0}function _y(){return!1}function Ht(t){function e(n,r,s,i,o){this._reactName=n,this._targetInst=s,this.type=r,this.nativeEvent=i,this.target=o,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(i):i[l]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?Dl:_y,this.isPropagationStopped=_y,this}return Ae(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Dl)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Dl)},persist:function(){},isPersistent:Dl}),e}var Xi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},wp=Ht(Xi),Ha=Ae({},Xi,{view:0,detail:0}),nA=Ht(Ha),$d,zd,bo,wc=Ae({},Ha,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ep,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==bo&&(bo&&t.type==="mousemove"?($d=t.screenX-bo.screenX,zd=t.screenY-bo.screenY):zd=$d=0,bo=t),$d)},movementY:function(t){return"movementY"in t?t.movementY:zd}}),wy=Ht(wc),rA=Ae({},wc,{dataTransfer:0}),sA=Ht(rA),iA=Ae({},Ha,{relatedTarget:0}),Wd=Ht(iA),oA=Ae({},Xi,{animationName:0,elapsedTime:0,pseudoElement:0}),aA=Ht(oA),lA=Ae({},Xi,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),uA=Ht(lA),cA=Ae({},Xi,{data:0}),Ey=Ht(cA),dA={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},hA={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},fA={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function pA(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=fA[t])?!!e[t]:!1}function Ep(){return pA}var mA=Ae({},Ha,{key:function(t){if(t.key){var e=dA[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=ru(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?hA[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ep,charCode:function(t){return t.type==="keypress"?ru(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?ru(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),gA=Ht(mA),yA=Ae({},wc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Ty=Ht(yA),vA=Ae({},Ha,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ep}),_A=Ht(vA),wA=Ae({},Xi,{propertyName:0,elapsedTime:0,pseudoElement:0}),EA=Ht(wA),TA=Ae({},wc,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),xA=Ht(TA),IA=[9,13,27,32],Tp=Xn&&"CompositionEvent"in window,Yo=null;Xn&&"documentMode"in document&&(Yo=document.documentMode);var SA=Xn&&"TextEvent"in window&&!Yo,yw=Xn&&(!Tp||Yo&&8<Yo&&11>=Yo),xy=" ",Iy=!1;function vw(t,e){switch(t){case"keyup":return IA.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function _w(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var fi=!1;function AA(t,e){switch(t){case"compositionend":return _w(e);case"keypress":return e.which!==32?null:(Iy=!0,xy);case"textInput":return t=e.data,t===xy&&Iy?null:t;default:return null}}function kA(t,e){if(fi)return t==="compositionend"||!Tp&&vw(t,e)?(t=gw(),nu=_p=Sr=null,fi=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return yw&&e.locale!=="ko"?null:e.data;default:return null}}var bA={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Sy(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!bA[t.type]:e==="textarea"}function ww(t,e,n,r){X0(r),e=Nu(e,"onChange"),0<e.length&&(n=new wp("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var Xo=null,ga=null;function CA(t){Rw(t,0)}function Ec(t){var e=gi(t);if(W0(e))return t}function NA(t,e){if(t==="change")return e}var Ew=!1;if(Xn){var Hd;if(Xn){var qd="oninput"in document;if(!qd){var Ay=document.createElement("div");Ay.setAttribute("oninput","return;"),qd=typeof Ay.oninput=="function"}Hd=qd}else Hd=!1;Ew=Hd&&(!document.documentMode||9<document.documentMode)}function ky(){Xo&&(Xo.detachEvent("onpropertychange",Tw),ga=Xo=null)}function Tw(t){if(t.propertyName==="value"&&Ec(ga)){var e=[];ww(e,ga,t,pp(t)),tw(CA,e)}}function RA(t,e,n){t==="focusin"?(ky(),Xo=e,ga=n,Xo.attachEvent("onpropertychange",Tw)):t==="focusout"&&ky()}function PA(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Ec(ga)}function DA(t,e){if(t==="click")return Ec(e)}function OA(t,e){if(t==="input"||t==="change")return Ec(e)}function MA(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var gn=typeof Object.is=="function"?Object.is:MA;function ya(t,e){if(gn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var s=n[r];if(!Rh.call(e,s)||!gn(t[s],e[s]))return!1}return!0}function by(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Cy(t,e){var n=by(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=by(n)}}function xw(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?xw(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Iw(){for(var t=window,e=xu();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=xu(t.document)}return e}function xp(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function jA(t){var e=Iw(),n=t.focusedElem,r=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&xw(n.ownerDocument.documentElement,n)){if(r!==null&&xp(n)){if(e=r.start,t=r.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var s=n.textContent.length,i=Math.min(r.start,s);r=r.end===void 0?i:Math.min(r.end,s),!t.extend&&i>r&&(s=r,r=i,i=s),s=Cy(n,i);var o=Cy(n,r);s&&o&&(t.rangeCount!==1||t.anchorNode!==s.node||t.anchorOffset!==s.offset||t.focusNode!==o.node||t.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(s.node,s.offset),t.removeAllRanges(),i>r?(t.addRange(e),t.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var LA=Xn&&"documentMode"in document&&11>=document.documentMode,pi=null,Yh=null,Jo=null,Xh=!1;function Ny(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Xh||pi==null||pi!==xu(r)||(r=pi,"selectionStart"in r&&xp(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Jo&&ya(Jo,r)||(Jo=r,r=Nu(Yh,"onSelect"),0<r.length&&(e=new wp("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=pi)))}function Ol(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var mi={animationend:Ol("Animation","AnimationEnd"),animationiteration:Ol("Animation","AnimationIteration"),animationstart:Ol("Animation","AnimationStart"),transitionend:Ol("Transition","TransitionEnd")},Gd={},Sw={};Xn&&(Sw=document.createElement("div").style,"AnimationEvent"in window||(delete mi.animationend.animation,delete mi.animationiteration.animation,delete mi.animationstart.animation),"TransitionEvent"in window||delete mi.transitionend.transition);function Tc(t){if(Gd[t])return Gd[t];if(!mi[t])return t;var e=mi[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Sw)return Gd[t]=e[n];return t}var Aw=Tc("animationend"),kw=Tc("animationiteration"),bw=Tc("animationstart"),Cw=Tc("transitionend"),Nw=new Map,Ry="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Xr(t,e){Nw.set(t,e),Hs(e,[t])}for(var Kd=0;Kd<Ry.length;Kd++){var Qd=Ry[Kd],VA=Qd.toLowerCase(),FA=Qd[0].toUpperCase()+Qd.slice(1);Xr(VA,"on"+FA)}Xr(Aw,"onAnimationEnd");Xr(kw,"onAnimationIteration");Xr(bw,"onAnimationStart");Xr("dblclick","onDoubleClick");Xr("focusin","onFocus");Xr("focusout","onBlur");Xr(Cw,"onTransitionEnd");Oi("onMouseEnter",["mouseout","mouseover"]);Oi("onMouseLeave",["mouseout","mouseover"]);Oi("onPointerEnter",["pointerout","pointerover"]);Oi("onPointerLeave",["pointerout","pointerover"]);Hs("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Hs("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Hs("onBeforeInput",["compositionend","keypress","textInput","paste"]);Hs("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Hs("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Hs("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Uo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),UA=new Set("cancel close invalid load scroll toggle".split(" ").concat(Uo));function Py(t,e,n){var r=t.type||"unknown-event";t.currentTarget=n,VS(r,e,void 0,t),t.currentTarget=null}function Rw(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],s=r.event;r=r.listeners;e:{var i=void 0;if(e)for(var o=r.length-1;0<=o;o--){var l=r[o],u=l.instance,c=l.currentTarget;if(l=l.listener,u!==i&&s.isPropagationStopped())break e;Py(s,l,c),i=u}else for(o=0;o<r.length;o++){if(l=r[o],u=l.instance,c=l.currentTarget,l=l.listener,u!==i&&s.isPropagationStopped())break e;Py(s,l,c),i=u}}}if(Su)throw t=qh,Su=!1,qh=null,t}function _e(t,e){var n=e[nf];n===void 0&&(n=e[nf]=new Set);var r=t+"__bubble";n.has(r)||(Pw(e,t,2,!1),n.add(r))}function Yd(t,e,n){var r=0;e&&(r|=4),Pw(n,t,r,e)}var Ml="_reactListening"+Math.random().toString(36).slice(2);function va(t){if(!t[Ml]){t[Ml]=!0,F0.forEach(function(n){n!=="selectionchange"&&(UA.has(n)||Yd(n,!1,t),Yd(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Ml]||(e[Ml]=!0,Yd("selectionchange",!1,e))}}function Pw(t,e,n,r){switch(mw(e)){case 1:var s=eA;break;case 4:s=tA;break;default:s=vp}n=s.bind(null,e,n,t),s=void 0,!Hh||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(s=!0),r?s!==void 0?t.addEventListener(e,n,{capture:!0,passive:s}):t.addEventListener(e,n,!0):s!==void 0?t.addEventListener(e,n,{passive:s}):t.addEventListener(e,n,!1)}function Xd(t,e,n,r,s){var i=r;if(!(e&1)&&!(e&2)&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var l=r.stateNode.containerInfo;if(l===s||l.nodeType===8&&l.parentNode===s)break;if(o===4)for(o=r.return;o!==null;){var u=o.tag;if((u===3||u===4)&&(u=o.stateNode.containerInfo,u===s||u.nodeType===8&&u.parentNode===s))return;o=o.return}for(;l!==null;){if(o=vs(l),o===null)return;if(u=o.tag,u===5||u===6){r=i=o;continue e}l=l.parentNode}}r=r.return}tw(function(){var c=i,f=pp(n),m=[];e:{var g=Nw.get(t);if(g!==void 0){var x=wp,A=t;switch(t){case"keypress":if(ru(n)===0)break e;case"keydown":case"keyup":x=gA;break;case"focusin":A="focus",x=Wd;break;case"focusout":A="blur",x=Wd;break;case"beforeblur":case"afterblur":x=Wd;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":x=wy;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":x=sA;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":x=_A;break;case Aw:case kw:case bw:x=aA;break;case Cw:x=EA;break;case"scroll":x=nA;break;case"wheel":x=xA;break;case"copy":case"cut":case"paste":x=uA;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":x=Ty}var C=(e&4)!==0,N=!C&&t==="scroll",E=C?g!==null?g+"Capture":null:g;C=[];for(var y=c,_;y!==null;){_=y;var R=_.stateNode;if(_.tag===5&&R!==null&&(_=R,E!==null&&(R=ha(y,E),R!=null&&C.push(_a(y,R,_)))),N)break;y=y.return}0<C.length&&(g=new x(g,A,null,n,f),m.push({event:g,listeners:C}))}}if(!(e&7)){e:{if(g=t==="mouseover"||t==="pointerover",x=t==="mouseout"||t==="pointerout",g&&n!==zh&&(A=n.relatedTarget||n.fromElement)&&(vs(A)||A[Jn]))break e;if((x||g)&&(g=f.window===f?f:(g=f.ownerDocument)?g.defaultView||g.parentWindow:window,x?(A=n.relatedTarget||n.toElement,x=c,A=A?vs(A):null,A!==null&&(N=qs(A),A!==N||A.tag!==5&&A.tag!==6)&&(A=null)):(x=null,A=c),x!==A)){if(C=wy,R="onMouseLeave",E="onMouseEnter",y="mouse",(t==="pointerout"||t==="pointerover")&&(C=Ty,R="onPointerLeave",E="onPointerEnter",y="pointer"),N=x==null?g:gi(x),_=A==null?g:gi(A),g=new C(R,y+"leave",x,n,f),g.target=N,g.relatedTarget=_,R=null,vs(f)===c&&(C=new C(E,y+"enter",A,n,f),C.target=_,C.relatedTarget=N,R=C),N=R,x&&A)t:{for(C=x,E=A,y=0,_=C;_;_=si(_))y++;for(_=0,R=E;R;R=si(R))_++;for(;0<y-_;)C=si(C),y--;for(;0<_-y;)E=si(E),_--;for(;y--;){if(C===E||E!==null&&C===E.alternate)break t;C=si(C),E=si(E)}C=null}else C=null;x!==null&&Dy(m,g,x,C,!1),A!==null&&N!==null&&Dy(m,N,A,C,!0)}}e:{if(g=c?gi(c):window,x=g.nodeName&&g.nodeName.toLowerCase(),x==="select"||x==="input"&&g.type==="file")var V=NA;else if(Sy(g))if(Ew)V=OA;else{V=PA;var j=RA}else(x=g.nodeName)&&x.toLowerCase()==="input"&&(g.type==="checkbox"||g.type==="radio")&&(V=DA);if(V&&(V=V(t,c))){ww(m,V,n,f);break e}j&&j(t,g,c),t==="focusout"&&(j=g._wrapperState)&&j.controlled&&g.type==="number"&&Vh(g,"number",g.value)}switch(j=c?gi(c):window,t){case"focusin":(Sy(j)||j.contentEditable==="true")&&(pi=j,Yh=c,Jo=null);break;case"focusout":Jo=Yh=pi=null;break;case"mousedown":Xh=!0;break;case"contextmenu":case"mouseup":case"dragend":Xh=!1,Ny(m,n,f);break;case"selectionchange":if(LA)break;case"keydown":case"keyup":Ny(m,n,f)}var I;if(Tp)e:{switch(t){case"compositionstart":var w="onCompositionStart";break e;case"compositionend":w="onCompositionEnd";break e;case"compositionupdate":w="onCompositionUpdate";break e}w=void 0}else fi?vw(t,n)&&(w="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(w="onCompositionStart");w&&(yw&&n.locale!=="ko"&&(fi||w!=="onCompositionStart"?w==="onCompositionEnd"&&fi&&(I=gw()):(Sr=f,_p="value"in Sr?Sr.value:Sr.textContent,fi=!0)),j=Nu(c,w),0<j.length&&(w=new Ey(w,t,null,n,f),m.push({event:w,listeners:j}),I?w.data=I:(I=_w(n),I!==null&&(w.data=I)))),(I=SA?AA(t,n):kA(t,n))&&(c=Nu(c,"onBeforeInput"),0<c.length&&(f=new Ey("onBeforeInput","beforeinput",null,n,f),m.push({event:f,listeners:c}),f.data=I))}Rw(m,e)})}function _a(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Nu(t,e){for(var n=e+"Capture",r=[];t!==null;){var s=t,i=s.stateNode;s.tag===5&&i!==null&&(s=i,i=ha(t,n),i!=null&&r.unshift(_a(t,i,s)),i=ha(t,e),i!=null&&r.push(_a(t,i,s))),t=t.return}return r}function si(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function Dy(t,e,n,r,s){for(var i=e._reactName,o=[];n!==null&&n!==r;){var l=n,u=l.alternate,c=l.stateNode;if(u!==null&&u===r)break;l.tag===5&&c!==null&&(l=c,s?(u=ha(n,i),u!=null&&o.unshift(_a(n,u,l))):s||(u=ha(n,i),u!=null&&o.push(_a(n,u,l)))),n=n.return}o.length!==0&&t.push({event:e,listeners:o})}var BA=/\r\n?/g,$A=/\u0000|\uFFFD/g;function Oy(t){return(typeof t=="string"?t:""+t).replace(BA,`
`).replace($A,"")}function jl(t,e,n){if(e=Oy(e),Oy(t)!==e&&n)throw Error(U(425))}function Ru(){}var Jh=null,Zh=null;function ef(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var tf=typeof setTimeout=="function"?setTimeout:void 0,zA=typeof clearTimeout=="function"?clearTimeout:void 0,My=typeof Promise=="function"?Promise:void 0,WA=typeof queueMicrotask=="function"?queueMicrotask:typeof My<"u"?function(t){return My.resolve(null).then(t).catch(HA)}:tf;function HA(t){setTimeout(function(){throw t})}function Jd(t,e){var n=e,r=0;do{var s=n.nextSibling;if(t.removeChild(n),s&&s.nodeType===8)if(n=s.data,n==="/$"){if(r===0){t.removeChild(s),ma(e);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=s}while(n);ma(e)}function Pr(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function jy(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Ji=Math.random().toString(36).slice(2),In="__reactFiber$"+Ji,wa="__reactProps$"+Ji,Jn="__reactContainer$"+Ji,nf="__reactEvents$"+Ji,qA="__reactListeners$"+Ji,GA="__reactHandles$"+Ji;function vs(t){var e=t[In];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Jn]||n[In]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=jy(t);t!==null;){if(n=t[In])return n;t=jy(t)}return e}t=n,n=t.parentNode}return null}function qa(t){return t=t[In]||t[Jn],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function gi(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(U(33))}function xc(t){return t[wa]||null}var rf=[],yi=-1;function Jr(t){return{current:t}}function Ee(t){0>yi||(t.current=rf[yi],rf[yi]=null,yi--)}function ye(t,e){yi++,rf[yi]=t.current,t.current=e}var zr={},mt=Jr(zr),Dt=Jr(!1),Ns=zr;function Mi(t,e){var n=t.type.contextTypes;if(!n)return zr;var r=t.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===e)return r.__reactInternalMemoizedMaskedChildContext;var s={},i;for(i in n)s[i]=e[i];return r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=s),s}function Ot(t){return t=t.childContextTypes,t!=null}function Pu(){Ee(Dt),Ee(mt)}function Ly(t,e,n){if(mt.current!==zr)throw Error(U(168));ye(mt,e),ye(Dt,n)}function Dw(t,e,n){var r=t.stateNode;if(e=e.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var s in r)if(!(s in e))throw Error(U(108,RS(t)||"Unknown",s));return Ae({},n,r)}function Du(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||zr,Ns=mt.current,ye(mt,t),ye(Dt,Dt.current),!0}function Vy(t,e,n){var r=t.stateNode;if(!r)throw Error(U(169));n?(t=Dw(t,e,Ns),r.__reactInternalMemoizedMergedChildContext=t,Ee(Dt),Ee(mt),ye(mt,t)):Ee(Dt),ye(Dt,n)}var Bn=null,Ic=!1,Zd=!1;function Ow(t){Bn===null?Bn=[t]:Bn.push(t)}function KA(t){Ic=!0,Ow(t)}function Zr(){if(!Zd&&Bn!==null){Zd=!0;var t=0,e=fe;try{var n=Bn;for(fe=1;t<n.length;t++){var r=n[t];do r=r(!0);while(r!==null)}Bn=null,Ic=!1}catch(s){throw Bn!==null&&(Bn=Bn.slice(t+1)),iw(mp,Zr),s}finally{fe=e,Zd=!1}}return null}var vi=[],_i=0,Ou=null,Mu=0,qt=[],Gt=0,Rs=null,zn=1,Wn="";function fs(t,e){vi[_i++]=Mu,vi[_i++]=Ou,Ou=t,Mu=e}function Mw(t,e,n){qt[Gt++]=zn,qt[Gt++]=Wn,qt[Gt++]=Rs,Rs=t;var r=zn;t=Wn;var s=32-fn(r)-1;r&=~(1<<s),n+=1;var i=32-fn(e)+s;if(30<i){var o=s-s%5;i=(r&(1<<o)-1).toString(32),r>>=o,s-=o,zn=1<<32-fn(e)+s|n<<s|r,Wn=i+t}else zn=1<<i|n<<s|r,Wn=t}function Ip(t){t.return!==null&&(fs(t,1),Mw(t,1,0))}function Sp(t){for(;t===Ou;)Ou=vi[--_i],vi[_i]=null,Mu=vi[--_i],vi[_i]=null;for(;t===Rs;)Rs=qt[--Gt],qt[Gt]=null,Wn=qt[--Gt],qt[Gt]=null,zn=qt[--Gt],qt[Gt]=null}var Bt=null,Vt=null,Te=!1,dn=null;function jw(t,e){var n=Qt(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function Fy(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,Bt=t,Vt=Pr(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,Bt=t,Vt=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=Rs!==null?{id:zn,overflow:Wn}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=Qt(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,Bt=t,Vt=null,!0):!1;default:return!1}}function sf(t){return(t.mode&1)!==0&&(t.flags&128)===0}function of(t){if(Te){var e=Vt;if(e){var n=e;if(!Fy(t,e)){if(sf(t))throw Error(U(418));e=Pr(n.nextSibling);var r=Bt;e&&Fy(t,e)?jw(r,n):(t.flags=t.flags&-4097|2,Te=!1,Bt=t)}}else{if(sf(t))throw Error(U(418));t.flags=t.flags&-4097|2,Te=!1,Bt=t}}}function Uy(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;Bt=t}function Ll(t){if(t!==Bt)return!1;if(!Te)return Uy(t),Te=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!ef(t.type,t.memoizedProps)),e&&(e=Vt)){if(sf(t))throw Lw(),Error(U(418));for(;e;)jw(t,e),e=Pr(e.nextSibling)}if(Uy(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(U(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){Vt=Pr(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}Vt=null}}else Vt=Bt?Pr(t.stateNode.nextSibling):null;return!0}function Lw(){for(var t=Vt;t;)t=Pr(t.nextSibling)}function ji(){Vt=Bt=null,Te=!1}function Ap(t){dn===null?dn=[t]:dn.push(t)}var QA=ir.ReactCurrentBatchConfig;function Co(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(U(309));var r=n.stateNode}if(!r)throw Error(U(147,t));var s=r,i=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===i?e.ref:(e=function(o){var l=s.refs;o===null?delete l[i]:l[i]=o},e._stringRef=i,e)}if(typeof t!="string")throw Error(U(284));if(!n._owner)throw Error(U(290,t))}return t}function Vl(t,e){throw t=Object.prototype.toString.call(e),Error(U(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function By(t){var e=t._init;return e(t._payload)}function Vw(t){function e(E,y){if(t){var _=E.deletions;_===null?(E.deletions=[y],E.flags|=16):_.push(y)}}function n(E,y){if(!t)return null;for(;y!==null;)e(E,y),y=y.sibling;return null}function r(E,y){for(E=new Map;y!==null;)y.key!==null?E.set(y.key,y):E.set(y.index,y),y=y.sibling;return E}function s(E,y){return E=jr(E,y),E.index=0,E.sibling=null,E}function i(E,y,_){return E.index=_,t?(_=E.alternate,_!==null?(_=_.index,_<y?(E.flags|=2,y):_):(E.flags|=2,y)):(E.flags|=1048576,y)}function o(E){return t&&E.alternate===null&&(E.flags|=2),E}function l(E,y,_,R){return y===null||y.tag!==6?(y=oh(_,E.mode,R),y.return=E,y):(y=s(y,_),y.return=E,y)}function u(E,y,_,R){var V=_.type;return V===hi?f(E,y,_.props.children,R,_.key):y!==null&&(y.elementType===V||typeof V=="object"&&V!==null&&V.$$typeof===gr&&By(V)===y.type)?(R=s(y,_.props),R.ref=Co(E,y,_),R.return=E,R):(R=cu(_.type,_.key,_.props,null,E.mode,R),R.ref=Co(E,y,_),R.return=E,R)}function c(E,y,_,R){return y===null||y.tag!==4||y.stateNode.containerInfo!==_.containerInfo||y.stateNode.implementation!==_.implementation?(y=ah(_,E.mode,R),y.return=E,y):(y=s(y,_.children||[]),y.return=E,y)}function f(E,y,_,R,V){return y===null||y.tag!==7?(y=Ss(_,E.mode,R,V),y.return=E,y):(y=s(y,_),y.return=E,y)}function m(E,y,_){if(typeof y=="string"&&y!==""||typeof y=="number")return y=oh(""+y,E.mode,_),y.return=E,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case kl:return _=cu(y.type,y.key,y.props,null,E.mode,_),_.ref=Co(E,null,y),_.return=E,_;case di:return y=ah(y,E.mode,_),y.return=E,y;case gr:var R=y._init;return m(E,R(y._payload),_)}if(Vo(y)||Io(y))return y=Ss(y,E.mode,_,null),y.return=E,y;Vl(E,y)}return null}function g(E,y,_,R){var V=y!==null?y.key:null;if(typeof _=="string"&&_!==""||typeof _=="number")return V!==null?null:l(E,y,""+_,R);if(typeof _=="object"&&_!==null){switch(_.$$typeof){case kl:return _.key===V?u(E,y,_,R):null;case di:return _.key===V?c(E,y,_,R):null;case gr:return V=_._init,g(E,y,V(_._payload),R)}if(Vo(_)||Io(_))return V!==null?null:f(E,y,_,R,null);Vl(E,_)}return null}function x(E,y,_,R,V){if(typeof R=="string"&&R!==""||typeof R=="number")return E=E.get(_)||null,l(y,E,""+R,V);if(typeof R=="object"&&R!==null){switch(R.$$typeof){case kl:return E=E.get(R.key===null?_:R.key)||null,u(y,E,R,V);case di:return E=E.get(R.key===null?_:R.key)||null,c(y,E,R,V);case gr:var j=R._init;return x(E,y,_,j(R._payload),V)}if(Vo(R)||Io(R))return E=E.get(_)||null,f(y,E,R,V,null);Vl(y,R)}return null}function A(E,y,_,R){for(var V=null,j=null,I=y,w=y=0,S=null;I!==null&&w<_.length;w++){I.index>w?(S=I,I=null):S=I.sibling;var T=g(E,I,_[w],R);if(T===null){I===null&&(I=S);break}t&&I&&T.alternate===null&&e(E,I),y=i(T,y,w),j===null?V=T:j.sibling=T,j=T,I=S}if(w===_.length)return n(E,I),Te&&fs(E,w),V;if(I===null){for(;w<_.length;w++)I=m(E,_[w],R),I!==null&&(y=i(I,y,w),j===null?V=I:j.sibling=I,j=I);return Te&&fs(E,w),V}for(I=r(E,I);w<_.length;w++)S=x(I,E,w,_[w],R),S!==null&&(t&&S.alternate!==null&&I.delete(S.key===null?w:S.key),y=i(S,y,w),j===null?V=S:j.sibling=S,j=S);return t&&I.forEach(function(b){return e(E,b)}),Te&&fs(E,w),V}function C(E,y,_,R){var V=Io(_);if(typeof V!="function")throw Error(U(150));if(_=V.call(_),_==null)throw Error(U(151));for(var j=V=null,I=y,w=y=0,S=null,T=_.next();I!==null&&!T.done;w++,T=_.next()){I.index>w?(S=I,I=null):S=I.sibling;var b=g(E,I,T.value,R);if(b===null){I===null&&(I=S);break}t&&I&&b.alternate===null&&e(E,I),y=i(b,y,w),j===null?V=b:j.sibling=b,j=b,I=S}if(T.done)return n(E,I),Te&&fs(E,w),V;if(I===null){for(;!T.done;w++,T=_.next())T=m(E,T.value,R),T!==null&&(y=i(T,y,w),j===null?V=T:j.sibling=T,j=T);return Te&&fs(E,w),V}for(I=r(E,I);!T.done;w++,T=_.next())T=x(I,E,w,T.value,R),T!==null&&(t&&T.alternate!==null&&I.delete(T.key===null?w:T.key),y=i(T,y,w),j===null?V=T:j.sibling=T,j=T);return t&&I.forEach(function(P){return e(E,P)}),Te&&fs(E,w),V}function N(E,y,_,R){if(typeof _=="object"&&_!==null&&_.type===hi&&_.key===null&&(_=_.props.children),typeof _=="object"&&_!==null){switch(_.$$typeof){case kl:e:{for(var V=_.key,j=y;j!==null;){if(j.key===V){if(V=_.type,V===hi){if(j.tag===7){n(E,j.sibling),y=s(j,_.props.children),y.return=E,E=y;break e}}else if(j.elementType===V||typeof V=="object"&&V!==null&&V.$$typeof===gr&&By(V)===j.type){n(E,j.sibling),y=s(j,_.props),y.ref=Co(E,j,_),y.return=E,E=y;break e}n(E,j);break}else e(E,j);j=j.sibling}_.type===hi?(y=Ss(_.props.children,E.mode,R,_.key),y.return=E,E=y):(R=cu(_.type,_.key,_.props,null,E.mode,R),R.ref=Co(E,y,_),R.return=E,E=R)}return o(E);case di:e:{for(j=_.key;y!==null;){if(y.key===j)if(y.tag===4&&y.stateNode.containerInfo===_.containerInfo&&y.stateNode.implementation===_.implementation){n(E,y.sibling),y=s(y,_.children||[]),y.return=E,E=y;break e}else{n(E,y);break}else e(E,y);y=y.sibling}y=ah(_,E.mode,R),y.return=E,E=y}return o(E);case gr:return j=_._init,N(E,y,j(_._payload),R)}if(Vo(_))return A(E,y,_,R);if(Io(_))return C(E,y,_,R);Vl(E,_)}return typeof _=="string"&&_!==""||typeof _=="number"?(_=""+_,y!==null&&y.tag===6?(n(E,y.sibling),y=s(y,_),y.return=E,E=y):(n(E,y),y=oh(_,E.mode,R),y.return=E,E=y),o(E)):n(E,y)}return N}var Li=Vw(!0),Fw=Vw(!1),ju=Jr(null),Lu=null,wi=null,kp=null;function bp(){kp=wi=Lu=null}function Cp(t){var e=ju.current;Ee(ju),t._currentValue=e}function af(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function ki(t,e){Lu=t,kp=wi=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(Rt=!0),t.firstContext=null)}function Jt(t){var e=t._currentValue;if(kp!==t)if(t={context:t,memoizedValue:e,next:null},wi===null){if(Lu===null)throw Error(U(308));wi=t,Lu.dependencies={lanes:0,firstContext:t}}else wi=wi.next=t;return e}var _s=null;function Np(t){_s===null?_s=[t]:_s.push(t)}function Uw(t,e,n,r){var s=e.interleaved;return s===null?(n.next=n,Np(e)):(n.next=s.next,s.next=n),e.interleaved=n,Zn(t,r)}function Zn(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var yr=!1;function Rp(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Bw(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function Kn(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function Dr(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,le&2){var s=r.pending;return s===null?e.next=e:(e.next=s.next,s.next=e),r.pending=e,Zn(t,n)}return s=r.interleaved,s===null?(e.next=e,Np(r)):(e.next=s.next,s.next=e),r.interleaved=e,Zn(t,n)}function su(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,gp(t,n)}}function $y(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var s=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};i===null?s=i=o:i=i.next=o,n=n.next}while(n!==null);i===null?s=i=e:i=i.next=e}else s=i=e;n={baseState:r.baseState,firstBaseUpdate:s,lastBaseUpdate:i,shared:r.shared,effects:r.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function Vu(t,e,n,r){var s=t.updateQueue;yr=!1;var i=s.firstBaseUpdate,o=s.lastBaseUpdate,l=s.shared.pending;if(l!==null){s.shared.pending=null;var u=l,c=u.next;u.next=null,o===null?i=c:o.next=c,o=u;var f=t.alternate;f!==null&&(f=f.updateQueue,l=f.lastBaseUpdate,l!==o&&(l===null?f.firstBaseUpdate=c:l.next=c,f.lastBaseUpdate=u))}if(i!==null){var m=s.baseState;o=0,f=c=u=null,l=i;do{var g=l.lane,x=l.eventTime;if((r&g)===g){f!==null&&(f=f.next={eventTime:x,lane:0,tag:l.tag,payload:l.payload,callback:l.callback,next:null});e:{var A=t,C=l;switch(g=e,x=n,C.tag){case 1:if(A=C.payload,typeof A=="function"){m=A.call(x,m,g);break e}m=A;break e;case 3:A.flags=A.flags&-65537|128;case 0:if(A=C.payload,g=typeof A=="function"?A.call(x,m,g):A,g==null)break e;m=Ae({},m,g);break e;case 2:yr=!0}}l.callback!==null&&l.lane!==0&&(t.flags|=64,g=s.effects,g===null?s.effects=[l]:g.push(l))}else x={eventTime:x,lane:g,tag:l.tag,payload:l.payload,callback:l.callback,next:null},f===null?(c=f=x,u=m):f=f.next=x,o|=g;if(l=l.next,l===null){if(l=s.shared.pending,l===null)break;g=l,l=g.next,g.next=null,s.lastBaseUpdate=g,s.shared.pending=null}}while(!0);if(f===null&&(u=m),s.baseState=u,s.firstBaseUpdate=c,s.lastBaseUpdate=f,e=s.shared.interleaved,e!==null){s=e;do o|=s.lane,s=s.next;while(s!==e)}else i===null&&(s.shared.lanes=0);Ds|=o,t.lanes=o,t.memoizedState=m}}function zy(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var r=t[e],s=r.callback;if(s!==null){if(r.callback=null,r=n,typeof s!="function")throw Error(U(191,s));s.call(r)}}}var Ga={},kn=Jr(Ga),Ea=Jr(Ga),Ta=Jr(Ga);function ws(t){if(t===Ga)throw Error(U(174));return t}function Pp(t,e){switch(ye(Ta,e),ye(Ea,t),ye(kn,Ga),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:Uh(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=Uh(e,t)}Ee(kn),ye(kn,e)}function Vi(){Ee(kn),Ee(Ea),Ee(Ta)}function $w(t){ws(Ta.current);var e=ws(kn.current),n=Uh(e,t.type);e!==n&&(ye(Ea,t),ye(kn,n))}function Dp(t){Ea.current===t&&(Ee(kn),Ee(Ea))}var Ie=Jr(0);function Fu(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var eh=[];function Op(){for(var t=0;t<eh.length;t++)eh[t]._workInProgressVersionPrimary=null;eh.length=0}var iu=ir.ReactCurrentDispatcher,th=ir.ReactCurrentBatchConfig,Ps=0,Se=null,$e=null,Ge=null,Uu=!1,Zo=!1,xa=0,YA=0;function ot(){throw Error(U(321))}function Mp(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!gn(t[n],e[n]))return!1;return!0}function jp(t,e,n,r,s,i){if(Ps=i,Se=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,iu.current=t===null||t.memoizedState===null?ek:tk,t=n(r,s),Zo){i=0;do{if(Zo=!1,xa=0,25<=i)throw Error(U(301));i+=1,Ge=$e=null,e.updateQueue=null,iu.current=nk,t=n(r,s)}while(Zo)}if(iu.current=Bu,e=$e!==null&&$e.next!==null,Ps=0,Ge=$e=Se=null,Uu=!1,e)throw Error(U(300));return t}function Lp(){var t=xa!==0;return xa=0,t}function En(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ge===null?Se.memoizedState=Ge=t:Ge=Ge.next=t,Ge}function Zt(){if($e===null){var t=Se.alternate;t=t!==null?t.memoizedState:null}else t=$e.next;var e=Ge===null?Se.memoizedState:Ge.next;if(e!==null)Ge=e,$e=t;else{if(t===null)throw Error(U(310));$e=t,t={memoizedState:$e.memoizedState,baseState:$e.baseState,baseQueue:$e.baseQueue,queue:$e.queue,next:null},Ge===null?Se.memoizedState=Ge=t:Ge=Ge.next=t}return Ge}function Ia(t,e){return typeof e=="function"?e(t):e}function nh(t){var e=Zt(),n=e.queue;if(n===null)throw Error(U(311));n.lastRenderedReducer=t;var r=$e,s=r.baseQueue,i=n.pending;if(i!==null){if(s!==null){var o=s.next;s.next=i.next,i.next=o}r.baseQueue=s=i,n.pending=null}if(s!==null){i=s.next,r=r.baseState;var l=o=null,u=null,c=i;do{var f=c.lane;if((Ps&f)===f)u!==null&&(u=u.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),r=c.hasEagerState?c.eagerState:t(r,c.action);else{var m={lane:f,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};u===null?(l=u=m,o=r):u=u.next=m,Se.lanes|=f,Ds|=f}c=c.next}while(c!==null&&c!==i);u===null?o=r:u.next=l,gn(r,e.memoizedState)||(Rt=!0),e.memoizedState=r,e.baseState=o,e.baseQueue=u,n.lastRenderedState=r}if(t=n.interleaved,t!==null){s=t;do i=s.lane,Se.lanes|=i,Ds|=i,s=s.next;while(s!==t)}else s===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function rh(t){var e=Zt(),n=e.queue;if(n===null)throw Error(U(311));n.lastRenderedReducer=t;var r=n.dispatch,s=n.pending,i=e.memoizedState;if(s!==null){n.pending=null;var o=s=s.next;do i=t(i,o.action),o=o.next;while(o!==s);gn(i,e.memoizedState)||(Rt=!0),e.memoizedState=i,e.baseQueue===null&&(e.baseState=i),n.lastRenderedState=i}return[i,r]}function zw(){}function Ww(t,e){var n=Se,r=Zt(),s=e(),i=!gn(r.memoizedState,s);if(i&&(r.memoizedState=s,Rt=!0),r=r.queue,Vp(Gw.bind(null,n,r,t),[t]),r.getSnapshot!==e||i||Ge!==null&&Ge.memoizedState.tag&1){if(n.flags|=2048,Sa(9,qw.bind(null,n,r,s,e),void 0,null),Ke===null)throw Error(U(349));Ps&30||Hw(n,e,s)}return s}function Hw(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=Se.updateQueue,e===null?(e={lastEffect:null,stores:null},Se.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function qw(t,e,n,r){e.value=n,e.getSnapshot=r,Kw(e)&&Qw(t)}function Gw(t,e,n){return n(function(){Kw(e)&&Qw(t)})}function Kw(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!gn(t,n)}catch{return!0}}function Qw(t){var e=Zn(t,1);e!==null&&pn(e,t,1,-1)}function Wy(t){var e=En();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Ia,lastRenderedState:t},e.queue=t,t=t.dispatch=ZA.bind(null,Se,t),[e.memoizedState,t]}function Sa(t,e,n,r){return t={tag:t,create:e,destroy:n,deps:r,next:null},e=Se.updateQueue,e===null?(e={lastEffect:null,stores:null},Se.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t)),t}function Yw(){return Zt().memoizedState}function ou(t,e,n,r){var s=En();Se.flags|=t,s.memoizedState=Sa(1|e,n,void 0,r===void 0?null:r)}function Sc(t,e,n,r){var s=Zt();r=r===void 0?null:r;var i=void 0;if($e!==null){var o=$e.memoizedState;if(i=o.destroy,r!==null&&Mp(r,o.deps)){s.memoizedState=Sa(e,n,i,r);return}}Se.flags|=t,s.memoizedState=Sa(1|e,n,i,r)}function Hy(t,e){return ou(8390656,8,t,e)}function Vp(t,e){return Sc(2048,8,t,e)}function Xw(t,e){return Sc(4,2,t,e)}function Jw(t,e){return Sc(4,4,t,e)}function Zw(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function eE(t,e,n){return n=n!=null?n.concat([t]):null,Sc(4,4,Zw.bind(null,e,t),n)}function Fp(){}function tE(t,e){var n=Zt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&Mp(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function nE(t,e){var n=Zt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&Mp(e,r[1])?r[0]:(t=t(),n.memoizedState=[t,e],t)}function rE(t,e,n){return Ps&21?(gn(n,e)||(n=lw(),Se.lanes|=n,Ds|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,Rt=!0),t.memoizedState=n)}function XA(t,e){var n=fe;fe=n!==0&&4>n?n:4,t(!0);var r=th.transition;th.transition={};try{t(!1),e()}finally{fe=n,th.transition=r}}function sE(){return Zt().memoizedState}function JA(t,e,n){var r=Mr(t);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},iE(t))oE(e,n);else if(n=Uw(t,e,n,r),n!==null){var s=xt();pn(n,t,r,s),aE(n,e,r)}}function ZA(t,e,n){var r=Mr(t),s={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(iE(t))oE(e,s);else{var i=t.alternate;if(t.lanes===0&&(i===null||i.lanes===0)&&(i=e.lastRenderedReducer,i!==null))try{var o=e.lastRenderedState,l=i(o,n);if(s.hasEagerState=!0,s.eagerState=l,gn(l,o)){var u=e.interleaved;u===null?(s.next=s,Np(e)):(s.next=u.next,u.next=s),e.interleaved=s;return}}catch{}finally{}n=Uw(t,e,s,r),n!==null&&(s=xt(),pn(n,t,r,s),aE(n,e,r))}}function iE(t){var e=t.alternate;return t===Se||e!==null&&e===Se}function oE(t,e){Zo=Uu=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function aE(t,e,n){if(n&4194240){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,gp(t,n)}}var Bu={readContext:Jt,useCallback:ot,useContext:ot,useEffect:ot,useImperativeHandle:ot,useInsertionEffect:ot,useLayoutEffect:ot,useMemo:ot,useReducer:ot,useRef:ot,useState:ot,useDebugValue:ot,useDeferredValue:ot,useTransition:ot,useMutableSource:ot,useSyncExternalStore:ot,useId:ot,unstable_isNewReconciler:!1},ek={readContext:Jt,useCallback:function(t,e){return En().memoizedState=[t,e===void 0?null:e],t},useContext:Jt,useEffect:Hy,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,ou(4194308,4,Zw.bind(null,e,t),n)},useLayoutEffect:function(t,e){return ou(4194308,4,t,e)},useInsertionEffect:function(t,e){return ou(4,2,t,e)},useMemo:function(t,e){var n=En();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var r=En();return e=n!==void 0?n(e):e,r.memoizedState=r.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},r.queue=t,t=t.dispatch=JA.bind(null,Se,t),[r.memoizedState,t]},useRef:function(t){var e=En();return t={current:t},e.memoizedState=t},useState:Wy,useDebugValue:Fp,useDeferredValue:function(t){return En().memoizedState=t},useTransition:function(){var t=Wy(!1),e=t[0];return t=XA.bind(null,t[1]),En().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var r=Se,s=En();if(Te){if(n===void 0)throw Error(U(407));n=n()}else{if(n=e(),Ke===null)throw Error(U(349));Ps&30||Hw(r,e,n)}s.memoizedState=n;var i={value:n,getSnapshot:e};return s.queue=i,Hy(Gw.bind(null,r,i,t),[t]),r.flags|=2048,Sa(9,qw.bind(null,r,i,n,e),void 0,null),n},useId:function(){var t=En(),e=Ke.identifierPrefix;if(Te){var n=Wn,r=zn;n=(r&~(1<<32-fn(r)-1)).toString(32)+n,e=":"+e+"R"+n,n=xa++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=YA++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},tk={readContext:Jt,useCallback:tE,useContext:Jt,useEffect:Vp,useImperativeHandle:eE,useInsertionEffect:Xw,useLayoutEffect:Jw,useMemo:nE,useReducer:nh,useRef:Yw,useState:function(){return nh(Ia)},useDebugValue:Fp,useDeferredValue:function(t){var e=Zt();return rE(e,$e.memoizedState,t)},useTransition:function(){var t=nh(Ia)[0],e=Zt().memoizedState;return[t,e]},useMutableSource:zw,useSyncExternalStore:Ww,useId:sE,unstable_isNewReconciler:!1},nk={readContext:Jt,useCallback:tE,useContext:Jt,useEffect:Vp,useImperativeHandle:eE,useInsertionEffect:Xw,useLayoutEffect:Jw,useMemo:nE,useReducer:rh,useRef:Yw,useState:function(){return rh(Ia)},useDebugValue:Fp,useDeferredValue:function(t){var e=Zt();return $e===null?e.memoizedState=t:rE(e,$e.memoizedState,t)},useTransition:function(){var t=rh(Ia)[0],e=Zt().memoizedState;return[t,e]},useMutableSource:zw,useSyncExternalStore:Ww,useId:sE,unstable_isNewReconciler:!1};function un(t,e){if(t&&t.defaultProps){e=Ae({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function lf(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:Ae({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Ac={isMounted:function(t){return(t=t._reactInternals)?qs(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var r=xt(),s=Mr(t),i=Kn(r,s);i.payload=e,n!=null&&(i.callback=n),e=Dr(t,i,s),e!==null&&(pn(e,t,s,r),su(e,t,s))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=xt(),s=Mr(t),i=Kn(r,s);i.tag=1,i.payload=e,n!=null&&(i.callback=n),e=Dr(t,i,s),e!==null&&(pn(e,t,s,r),su(e,t,s))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=xt(),r=Mr(t),s=Kn(n,r);s.tag=2,e!=null&&(s.callback=e),e=Dr(t,s,r),e!==null&&(pn(e,t,r,n),su(e,t,r))}};function qy(t,e,n,r,s,i,o){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,i,o):e.prototype&&e.prototype.isPureReactComponent?!ya(n,r)||!ya(s,i):!0}function lE(t,e,n){var r=!1,s=zr,i=e.contextType;return typeof i=="object"&&i!==null?i=Jt(i):(s=Ot(e)?Ns:mt.current,r=e.contextTypes,i=(r=r!=null)?Mi(t,s):zr),e=new e(n,i),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Ac,t.stateNode=e,e._reactInternals=t,r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=s,t.__reactInternalMemoizedMaskedChildContext=i),e}function Gy(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&Ac.enqueueReplaceState(e,e.state,null)}function uf(t,e,n,r){var s=t.stateNode;s.props=n,s.state=t.memoizedState,s.refs={},Rp(t);var i=e.contextType;typeof i=="object"&&i!==null?s.context=Jt(i):(i=Ot(e)?Ns:mt.current,s.context=Mi(t,i)),s.state=t.memoizedState,i=e.getDerivedStateFromProps,typeof i=="function"&&(lf(t,e,i,n),s.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(e=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),e!==s.state&&Ac.enqueueReplaceState(s,s.state,null),Vu(t,n,s,r),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308)}function Fi(t,e){try{var n="",r=e;do n+=NS(r),r=r.return;while(r);var s=n}catch(i){s=`
Error generating stack: `+i.message+`
`+i.stack}return{value:t,source:e,stack:s,digest:null}}function sh(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function cf(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var rk=typeof WeakMap=="function"?WeakMap:Map;function uE(t,e,n){n=Kn(-1,n),n.tag=3,n.payload={element:null};var r=e.value;return n.callback=function(){zu||(zu=!0,wf=r),cf(t,e)},n}function cE(t,e,n){n=Kn(-1,n),n.tag=3;var r=t.type.getDerivedStateFromError;if(typeof r=="function"){var s=e.value;n.payload=function(){return r(s)},n.callback=function(){cf(t,e)}}var i=t.stateNode;return i!==null&&typeof i.componentDidCatch=="function"&&(n.callback=function(){cf(t,e),typeof r!="function"&&(Or===null?Or=new Set([this]):Or.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),n}function Ky(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new rk;var s=new Set;r.set(e,s)}else s=r.get(e),s===void 0&&(s=new Set,r.set(e,s));s.has(n)||(s.add(n),t=yk.bind(null,t,e,n),e.then(t,t))}function Qy(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function Yy(t,e,n,r,s){return t.mode&1?(t.flags|=65536,t.lanes=s,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=Kn(-1,1),e.tag=2,Dr(n,e,1))),n.lanes|=1),t)}var sk=ir.ReactCurrentOwner,Rt=!1;function Et(t,e,n,r){e.child=t===null?Fw(e,null,n,r):Li(e,t.child,n,r)}function Xy(t,e,n,r,s){n=n.render;var i=e.ref;return ki(e,s),r=jp(t,e,n,r,i,s),n=Lp(),t!==null&&!Rt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~s,er(t,e,s)):(Te&&n&&Ip(e),e.flags|=1,Et(t,e,r,s),e.child)}function Jy(t,e,n,r,s){if(t===null){var i=n.type;return typeof i=="function"&&!Gp(i)&&i.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=i,dE(t,e,i,r,s)):(t=cu(n.type,null,r,e,e.mode,s),t.ref=e.ref,t.return=e,e.child=t)}if(i=t.child,!(t.lanes&s)){var o=i.memoizedProps;if(n=n.compare,n=n!==null?n:ya,n(o,r)&&t.ref===e.ref)return er(t,e,s)}return e.flags|=1,t=jr(i,r),t.ref=e.ref,t.return=e,e.child=t}function dE(t,e,n,r,s){if(t!==null){var i=t.memoizedProps;if(ya(i,r)&&t.ref===e.ref)if(Rt=!1,e.pendingProps=r=i,(t.lanes&s)!==0)t.flags&131072&&(Rt=!0);else return e.lanes=t.lanes,er(t,e,s)}return df(t,e,n,r,s)}function hE(t,e,n){var r=e.pendingProps,s=r.children,i=t!==null?t.memoizedState:null;if(r.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},ye(Ti,Lt),Lt|=n;else{if(!(n&1073741824))return t=i!==null?i.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,ye(Ti,Lt),Lt|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=i!==null?i.baseLanes:n,ye(Ti,Lt),Lt|=r}else i!==null?(r=i.baseLanes|n,e.memoizedState=null):r=n,ye(Ti,Lt),Lt|=r;return Et(t,e,s,n),e.child}function fE(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function df(t,e,n,r,s){var i=Ot(n)?Ns:mt.current;return i=Mi(e,i),ki(e,s),n=jp(t,e,n,r,i,s),r=Lp(),t!==null&&!Rt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~s,er(t,e,s)):(Te&&r&&Ip(e),e.flags|=1,Et(t,e,n,s),e.child)}function Zy(t,e,n,r,s){if(Ot(n)){var i=!0;Du(e)}else i=!1;if(ki(e,s),e.stateNode===null)au(t,e),lE(e,n,r),uf(e,n,r,s),r=!0;else if(t===null){var o=e.stateNode,l=e.memoizedProps;o.props=l;var u=o.context,c=n.contextType;typeof c=="object"&&c!==null?c=Jt(c):(c=Ot(n)?Ns:mt.current,c=Mi(e,c));var f=n.getDerivedStateFromProps,m=typeof f=="function"||typeof o.getSnapshotBeforeUpdate=="function";m||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==r||u!==c)&&Gy(e,o,r,c),yr=!1;var g=e.memoizedState;o.state=g,Vu(e,r,o,s),u=e.memoizedState,l!==r||g!==u||Dt.current||yr?(typeof f=="function"&&(lf(e,n,f,r),u=e.memoizedState),(l=yr||qy(e,n,l,r,g,u,c))?(m||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=u),o.props=r,o.state=u,o.context=c,r=l):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{o=e.stateNode,Bw(t,e),l=e.memoizedProps,c=e.type===e.elementType?l:un(e.type,l),o.props=c,m=e.pendingProps,g=o.context,u=n.contextType,typeof u=="object"&&u!==null?u=Jt(u):(u=Ot(n)?Ns:mt.current,u=Mi(e,u));var x=n.getDerivedStateFromProps;(f=typeof x=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==m||g!==u)&&Gy(e,o,r,u),yr=!1,g=e.memoizedState,o.state=g,Vu(e,r,o,s);var A=e.memoizedState;l!==m||g!==A||Dt.current||yr?(typeof x=="function"&&(lf(e,n,x,r),A=e.memoizedState),(c=yr||qy(e,n,c,r,g,A,u)||!1)?(f||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(r,A,u),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(r,A,u)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&g===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&g===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=A),o.props=r,o.state=A,o.context=u,r=c):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&g===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&g===t.memoizedState||(e.flags|=1024),r=!1)}return hf(t,e,n,r,i,s)}function hf(t,e,n,r,s,i){fE(t,e);var o=(e.flags&128)!==0;if(!r&&!o)return s&&Vy(e,n,!1),er(t,e,i);r=e.stateNode,sk.current=e;var l=o&&typeof n.getDerivedStateFromError!="function"?null:r.render();return e.flags|=1,t!==null&&o?(e.child=Li(e,t.child,null,i),e.child=Li(e,null,l,i)):Et(t,e,l,i),e.memoizedState=r.state,s&&Vy(e,n,!0),e.child}function pE(t){var e=t.stateNode;e.pendingContext?Ly(t,e.pendingContext,e.pendingContext!==e.context):e.context&&Ly(t,e.context,!1),Pp(t,e.containerInfo)}function ev(t,e,n,r,s){return ji(),Ap(s),e.flags|=256,Et(t,e,n,r),e.child}var ff={dehydrated:null,treeContext:null,retryLane:0};function pf(t){return{baseLanes:t,cachePool:null,transitions:null}}function mE(t,e,n){var r=e.pendingProps,s=Ie.current,i=!1,o=(e.flags&128)!==0,l;if((l=o)||(l=t!==null&&t.memoizedState===null?!1:(s&2)!==0),l?(i=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(s|=1),ye(Ie,s&1),t===null)return of(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(o=r.children,t=r.fallback,i?(r=e.mode,i=e.child,o={mode:"hidden",children:o},!(r&1)&&i!==null?(i.childLanes=0,i.pendingProps=o):i=Cc(o,r,0,null),t=Ss(t,r,n,null),i.return=e,t.return=e,i.sibling=t,e.child=i,e.child.memoizedState=pf(n),e.memoizedState=ff,t):Up(e,o));if(s=t.memoizedState,s!==null&&(l=s.dehydrated,l!==null))return ik(t,e,o,r,l,s,n);if(i){i=r.fallback,o=e.mode,s=t.child,l=s.sibling;var u={mode:"hidden",children:r.children};return!(o&1)&&e.child!==s?(r=e.child,r.childLanes=0,r.pendingProps=u,e.deletions=null):(r=jr(s,u),r.subtreeFlags=s.subtreeFlags&14680064),l!==null?i=jr(l,i):(i=Ss(i,o,n,null),i.flags|=2),i.return=e,r.return=e,r.sibling=i,e.child=r,r=i,i=e.child,o=t.child.memoizedState,o=o===null?pf(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},i.memoizedState=o,i.childLanes=t.childLanes&~n,e.memoizedState=ff,r}return i=t.child,t=i.sibling,r=jr(i,{mode:"visible",children:r.children}),!(e.mode&1)&&(r.lanes=n),r.return=e,r.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=r,e.memoizedState=null,r}function Up(t,e){return e=Cc({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function Fl(t,e,n,r){return r!==null&&Ap(r),Li(e,t.child,null,n),t=Up(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function ik(t,e,n,r,s,i,o){if(n)return e.flags&256?(e.flags&=-257,r=sh(Error(U(422))),Fl(t,e,o,r)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(i=r.fallback,s=e.mode,r=Cc({mode:"visible",children:r.children},s,0,null),i=Ss(i,s,o,null),i.flags|=2,r.return=e,i.return=e,r.sibling=i,e.child=r,e.mode&1&&Li(e,t.child,null,o),e.child.memoizedState=pf(o),e.memoizedState=ff,i);if(!(e.mode&1))return Fl(t,e,o,null);if(s.data==="$!"){if(r=s.nextSibling&&s.nextSibling.dataset,r)var l=r.dgst;return r=l,i=Error(U(419)),r=sh(i,r,void 0),Fl(t,e,o,r)}if(l=(o&t.childLanes)!==0,Rt||l){if(r=Ke,r!==null){switch(o&-o){case 4:s=2;break;case 16:s=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:s=32;break;case 536870912:s=268435456;break;default:s=0}s=s&(r.suspendedLanes|o)?0:s,s!==0&&s!==i.retryLane&&(i.retryLane=s,Zn(t,s),pn(r,t,s,-1))}return qp(),r=sh(Error(U(421))),Fl(t,e,o,r)}return s.data==="$?"?(e.flags|=128,e.child=t.child,e=vk.bind(null,t),s._reactRetry=e,null):(t=i.treeContext,Vt=Pr(s.nextSibling),Bt=e,Te=!0,dn=null,t!==null&&(qt[Gt++]=zn,qt[Gt++]=Wn,qt[Gt++]=Rs,zn=t.id,Wn=t.overflow,Rs=e),e=Up(e,r.children),e.flags|=4096,e)}function tv(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),af(t.return,e,n)}function ih(t,e,n,r,s){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:s}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=r,i.tail=n,i.tailMode=s)}function gE(t,e,n){var r=e.pendingProps,s=r.revealOrder,i=r.tail;if(Et(t,e,r.children,n),r=Ie.current,r&2)r=r&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&tv(t,n,e);else if(t.tag===19)tv(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}r&=1}if(ye(Ie,r),!(e.mode&1))e.memoizedState=null;else switch(s){case"forwards":for(n=e.child,s=null;n!==null;)t=n.alternate,t!==null&&Fu(t)===null&&(s=n),n=n.sibling;n=s,n===null?(s=e.child,e.child=null):(s=n.sibling,n.sibling=null),ih(e,!1,s,n,i);break;case"backwards":for(n=null,s=e.child,e.child=null;s!==null;){if(t=s.alternate,t!==null&&Fu(t)===null){e.child=s;break}t=s.sibling,s.sibling=n,n=s,s=t}ih(e,!0,n,null,i);break;case"together":ih(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function au(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function er(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Ds|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(U(153));if(e.child!==null){for(t=e.child,n=jr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=jr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function ok(t,e,n){switch(e.tag){case 3:pE(e),ji();break;case 5:$w(e);break;case 1:Ot(e.type)&&Du(e);break;case 4:Pp(e,e.stateNode.containerInfo);break;case 10:var r=e.type._context,s=e.memoizedProps.value;ye(ju,r._currentValue),r._currentValue=s;break;case 13:if(r=e.memoizedState,r!==null)return r.dehydrated!==null?(ye(Ie,Ie.current&1),e.flags|=128,null):n&e.child.childLanes?mE(t,e,n):(ye(Ie,Ie.current&1),t=er(t,e,n),t!==null?t.sibling:null);ye(Ie,Ie.current&1);break;case 19:if(r=(n&e.childLanes)!==0,t.flags&128){if(r)return gE(t,e,n);e.flags|=128}if(s=e.memoizedState,s!==null&&(s.rendering=null,s.tail=null,s.lastEffect=null),ye(Ie,Ie.current),r)break;return null;case 22:case 23:return e.lanes=0,hE(t,e,n)}return er(t,e,n)}var yE,mf,vE,_E;yE=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};mf=function(){};vE=function(t,e,n,r){var s=t.memoizedProps;if(s!==r){t=e.stateNode,ws(kn.current);var i=null;switch(n){case"input":s=jh(t,s),r=jh(t,r),i=[];break;case"select":s=Ae({},s,{value:void 0}),r=Ae({},r,{value:void 0}),i=[];break;case"textarea":s=Fh(t,s),r=Fh(t,r),i=[];break;default:typeof s.onClick!="function"&&typeof r.onClick=="function"&&(t.onclick=Ru)}Bh(n,r);var o;n=null;for(c in s)if(!r.hasOwnProperty(c)&&s.hasOwnProperty(c)&&s[c]!=null)if(c==="style"){var l=s[c];for(o in l)l.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(ca.hasOwnProperty(c)?i||(i=[]):(i=i||[]).push(c,null));for(c in r){var u=r[c];if(l=s!=null?s[c]:void 0,r.hasOwnProperty(c)&&u!==l&&(u!=null||l!=null))if(c==="style")if(l){for(o in l)!l.hasOwnProperty(o)||u&&u.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in u)u.hasOwnProperty(o)&&l[o]!==u[o]&&(n||(n={}),n[o]=u[o])}else n||(i||(i=[]),i.push(c,n)),n=u;else c==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,l=l?l.__html:void 0,u!=null&&l!==u&&(i=i||[]).push(c,u)):c==="children"?typeof u!="string"&&typeof u!="number"||(i=i||[]).push(c,""+u):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(ca.hasOwnProperty(c)?(u!=null&&c==="onScroll"&&_e("scroll",t),i||l===u||(i=[])):(i=i||[]).push(c,u))}n&&(i=i||[]).push("style",n);var c=i;(e.updateQueue=c)&&(e.flags|=4)}};_E=function(t,e,n,r){n!==r&&(e.flags|=4)};function No(t,e){if(!Te)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function at(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var s=t.child;s!==null;)n|=s.lanes|s.childLanes,r|=s.subtreeFlags&14680064,r|=s.flags&14680064,s.return=t,s=s.sibling;else for(s=t.child;s!==null;)n|=s.lanes|s.childLanes,r|=s.subtreeFlags,r|=s.flags,s.return=t,s=s.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function ak(t,e,n){var r=e.pendingProps;switch(Sp(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return at(e),null;case 1:return Ot(e.type)&&Pu(),at(e),null;case 3:return r=e.stateNode,Vi(),Ee(Dt),Ee(mt),Op(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(t===null||t.child===null)&&(Ll(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,dn!==null&&(xf(dn),dn=null))),mf(t,e),at(e),null;case 5:Dp(e);var s=ws(Ta.current);if(n=e.type,t!==null&&e.stateNode!=null)vE(t,e,n,r,s),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!r){if(e.stateNode===null)throw Error(U(166));return at(e),null}if(t=ws(kn.current),Ll(e)){r=e.stateNode,n=e.type;var i=e.memoizedProps;switch(r[In]=e,r[wa]=i,t=(e.mode&1)!==0,n){case"dialog":_e("cancel",r),_e("close",r);break;case"iframe":case"object":case"embed":_e("load",r);break;case"video":case"audio":for(s=0;s<Uo.length;s++)_e(Uo[s],r);break;case"source":_e("error",r);break;case"img":case"image":case"link":_e("error",r),_e("load",r);break;case"details":_e("toggle",r);break;case"input":cy(r,i),_e("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!i.multiple},_e("invalid",r);break;case"textarea":hy(r,i),_e("invalid",r)}Bh(n,i),s=null;for(var o in i)if(i.hasOwnProperty(o)){var l=i[o];o==="children"?typeof l=="string"?r.textContent!==l&&(i.suppressHydrationWarning!==!0&&jl(r.textContent,l,t),s=["children",l]):typeof l=="number"&&r.textContent!==""+l&&(i.suppressHydrationWarning!==!0&&jl(r.textContent,l,t),s=["children",""+l]):ca.hasOwnProperty(o)&&l!=null&&o==="onScroll"&&_e("scroll",r)}switch(n){case"input":bl(r),dy(r,i,!0);break;case"textarea":bl(r),fy(r);break;case"select":case"option":break;default:typeof i.onClick=="function"&&(r.onclick=Ru)}r=s,e.updateQueue=r,r!==null&&(e.flags|=4)}else{o=s.nodeType===9?s:s.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=G0(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=o.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof r.is=="string"?t=o.createElement(n,{is:r.is}):(t=o.createElement(n),n==="select"&&(o=t,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):t=o.createElementNS(t,n),t[In]=e,t[wa]=r,yE(t,e,!1,!1),e.stateNode=t;e:{switch(o=$h(n,r),n){case"dialog":_e("cancel",t),_e("close",t),s=r;break;case"iframe":case"object":case"embed":_e("load",t),s=r;break;case"video":case"audio":for(s=0;s<Uo.length;s++)_e(Uo[s],t);s=r;break;case"source":_e("error",t),s=r;break;case"img":case"image":case"link":_e("error",t),_e("load",t),s=r;break;case"details":_e("toggle",t),s=r;break;case"input":cy(t,r),s=jh(t,r),_e("invalid",t);break;case"option":s=r;break;case"select":t._wrapperState={wasMultiple:!!r.multiple},s=Ae({},r,{value:void 0}),_e("invalid",t);break;case"textarea":hy(t,r),s=Fh(t,r),_e("invalid",t);break;default:s=r}Bh(n,s),l=s;for(i in l)if(l.hasOwnProperty(i)){var u=l[i];i==="style"?Y0(t,u):i==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&K0(t,u)):i==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&da(t,u):typeof u=="number"&&da(t,""+u):i!=="suppressContentEditableWarning"&&i!=="suppressHydrationWarning"&&i!=="autoFocus"&&(ca.hasOwnProperty(i)?u!=null&&i==="onScroll"&&_e("scroll",t):u!=null&&cp(t,i,u,o))}switch(n){case"input":bl(t),dy(t,r,!1);break;case"textarea":bl(t),fy(t);break;case"option":r.value!=null&&t.setAttribute("value",""+$r(r.value));break;case"select":t.multiple=!!r.multiple,i=r.value,i!=null?xi(t,!!r.multiple,i,!1):r.defaultValue!=null&&xi(t,!!r.multiple,r.defaultValue,!0);break;default:typeof s.onClick=="function"&&(t.onclick=Ru)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return at(e),null;case 6:if(t&&e.stateNode!=null)_E(t,e,t.memoizedProps,r);else{if(typeof r!="string"&&e.stateNode===null)throw Error(U(166));if(n=ws(Ta.current),ws(kn.current),Ll(e)){if(r=e.stateNode,n=e.memoizedProps,r[In]=e,(i=r.nodeValue!==n)&&(t=Bt,t!==null))switch(t.tag){case 3:jl(r.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&jl(r.nodeValue,n,(t.mode&1)!==0)}i&&(e.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[In]=e,e.stateNode=r}return at(e),null;case 13:if(Ee(Ie),r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(Te&&Vt!==null&&e.mode&1&&!(e.flags&128))Lw(),ji(),e.flags|=98560,i=!1;else if(i=Ll(e),r!==null&&r.dehydrated!==null){if(t===null){if(!i)throw Error(U(318));if(i=e.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(U(317));i[In]=e}else ji(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;at(e),i=!1}else dn!==null&&(xf(dn),dn=null),i=!0;if(!i)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(r=r!==null,r!==(t!==null&&t.memoizedState!==null)&&r&&(e.child.flags|=8192,e.mode&1&&(t===null||Ie.current&1?ze===0&&(ze=3):qp())),e.updateQueue!==null&&(e.flags|=4),at(e),null);case 4:return Vi(),mf(t,e),t===null&&va(e.stateNode.containerInfo),at(e),null;case 10:return Cp(e.type._context),at(e),null;case 17:return Ot(e.type)&&Pu(),at(e),null;case 19:if(Ee(Ie),i=e.memoizedState,i===null)return at(e),null;if(r=(e.flags&128)!==0,o=i.rendering,o===null)if(r)No(i,!1);else{if(ze!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(o=Fu(t),o!==null){for(e.flags|=128,No(i,!1),r=o.updateQueue,r!==null&&(e.updateQueue=r,e.flags|=4),e.subtreeFlags=0,r=n,n=e.child;n!==null;)i=n,t=r,i.flags&=14680066,o=i.alternate,o===null?(i.childLanes=0,i.lanes=t,i.child=null,i.subtreeFlags=0,i.memoizedProps=null,i.memoizedState=null,i.updateQueue=null,i.dependencies=null,i.stateNode=null):(i.childLanes=o.childLanes,i.lanes=o.lanes,i.child=o.child,i.subtreeFlags=0,i.deletions=null,i.memoizedProps=o.memoizedProps,i.memoizedState=o.memoizedState,i.updateQueue=o.updateQueue,i.type=o.type,t=o.dependencies,i.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return ye(Ie,Ie.current&1|2),e.child}t=t.sibling}i.tail!==null&&Oe()>Ui&&(e.flags|=128,r=!0,No(i,!1),e.lanes=4194304)}else{if(!r)if(t=Fu(o),t!==null){if(e.flags|=128,r=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),No(i,!0),i.tail===null&&i.tailMode==="hidden"&&!o.alternate&&!Te)return at(e),null}else 2*Oe()-i.renderingStartTime>Ui&&n!==1073741824&&(e.flags|=128,r=!0,No(i,!1),e.lanes=4194304);i.isBackwards?(o.sibling=e.child,e.child=o):(n=i.last,n!==null?n.sibling=o:e.child=o,i.last=o)}return i.tail!==null?(e=i.tail,i.rendering=e,i.tail=e.sibling,i.renderingStartTime=Oe(),e.sibling=null,n=Ie.current,ye(Ie,r?n&1|2:n&1),e):(at(e),null);case 22:case 23:return Hp(),r=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==r&&(e.flags|=8192),r&&e.mode&1?Lt&1073741824&&(at(e),e.subtreeFlags&6&&(e.flags|=8192)):at(e),null;case 24:return null;case 25:return null}throw Error(U(156,e.tag))}function lk(t,e){switch(Sp(e),e.tag){case 1:return Ot(e.type)&&Pu(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Vi(),Ee(Dt),Ee(mt),Op(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return Dp(e),null;case 13:if(Ee(Ie),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(U(340));ji()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Ee(Ie),null;case 4:return Vi(),null;case 10:return Cp(e.type._context),null;case 22:case 23:return Hp(),null;case 24:return null;default:return null}}var Ul=!1,ct=!1,uk=typeof WeakSet=="function"?WeakSet:Set,q=null;function Ei(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Ce(t,e,r)}else n.current=null}function gf(t,e,n){try{n()}catch(r){Ce(t,e,r)}}var nv=!1;function ck(t,e){if(Jh=bu,t=Iw(),xp(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var s=r.anchorOffset,i=r.focusNode;r=r.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var o=0,l=-1,u=-1,c=0,f=0,m=t,g=null;t:for(;;){for(var x;m!==n||s!==0&&m.nodeType!==3||(l=o+s),m!==i||r!==0&&m.nodeType!==3||(u=o+r),m.nodeType===3&&(o+=m.nodeValue.length),(x=m.firstChild)!==null;)g=m,m=x;for(;;){if(m===t)break t;if(g===n&&++c===s&&(l=o),g===i&&++f===r&&(u=o),(x=m.nextSibling)!==null)break;m=g,g=m.parentNode}m=x}n=l===-1||u===-1?null:{start:l,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(Zh={focusedElem:t,selectionRange:n},bu=!1,q=e;q!==null;)if(e=q,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,q=t;else for(;q!==null;){e=q;try{var A=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(A!==null){var C=A.memoizedProps,N=A.memoizedState,E=e.stateNode,y=E.getSnapshotBeforeUpdate(e.elementType===e.type?C:un(e.type,C),N);E.__reactInternalSnapshotBeforeUpdate=y}break;case 3:var _=e.stateNode.containerInfo;_.nodeType===1?_.textContent="":_.nodeType===9&&_.documentElement&&_.removeChild(_.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(U(163))}}catch(R){Ce(e,e.return,R)}if(t=e.sibling,t!==null){t.return=e.return,q=t;break}q=e.return}return A=nv,nv=!1,A}function ea(t,e,n){var r=e.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var s=r=r.next;do{if((s.tag&t)===t){var i=s.destroy;s.destroy=void 0,i!==void 0&&gf(e,n,i)}s=s.next}while(s!==r)}}function kc(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var r=n.create;n.destroy=r()}n=n.next}while(n!==e)}}function yf(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function wE(t){var e=t.alternate;e!==null&&(t.alternate=null,wE(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[In],delete e[wa],delete e[nf],delete e[qA],delete e[GA])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function EE(t){return t.tag===5||t.tag===3||t.tag===4}function rv(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||EE(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function vf(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Ru));else if(r!==4&&(t=t.child,t!==null))for(vf(t,e,n),t=t.sibling;t!==null;)vf(t,e,n),t=t.sibling}function _f(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(t=t.child,t!==null))for(_f(t,e,n),t=t.sibling;t!==null;)_f(t,e,n),t=t.sibling}var Ye=null,cn=!1;function fr(t,e,n){for(n=n.child;n!==null;)TE(t,e,n),n=n.sibling}function TE(t,e,n){if(An&&typeof An.onCommitFiberUnmount=="function")try{An.onCommitFiberUnmount(_c,n)}catch{}switch(n.tag){case 5:ct||Ei(n,e);case 6:var r=Ye,s=cn;Ye=null,fr(t,e,n),Ye=r,cn=s,Ye!==null&&(cn?(t=Ye,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Ye.removeChild(n.stateNode));break;case 18:Ye!==null&&(cn?(t=Ye,n=n.stateNode,t.nodeType===8?Jd(t.parentNode,n):t.nodeType===1&&Jd(t,n),ma(t)):Jd(Ye,n.stateNode));break;case 4:r=Ye,s=cn,Ye=n.stateNode.containerInfo,cn=!0,fr(t,e,n),Ye=r,cn=s;break;case 0:case 11:case 14:case 15:if(!ct&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){s=r=r.next;do{var i=s,o=i.destroy;i=i.tag,o!==void 0&&(i&2||i&4)&&gf(n,e,o),s=s.next}while(s!==r)}fr(t,e,n);break;case 1:if(!ct&&(Ei(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(l){Ce(n,e,l)}fr(t,e,n);break;case 21:fr(t,e,n);break;case 22:n.mode&1?(ct=(r=ct)||n.memoizedState!==null,fr(t,e,n),ct=r):fr(t,e,n);break;default:fr(t,e,n)}}function sv(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new uk),e.forEach(function(r){var s=_k.bind(null,t,r);n.has(r)||(n.add(r),r.then(s,s))})}}function ln(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var s=n[r];try{var i=t,o=e,l=o;e:for(;l!==null;){switch(l.tag){case 5:Ye=l.stateNode,cn=!1;break e;case 3:Ye=l.stateNode.containerInfo,cn=!0;break e;case 4:Ye=l.stateNode.containerInfo,cn=!0;break e}l=l.return}if(Ye===null)throw Error(U(160));TE(i,o,s),Ye=null,cn=!1;var u=s.alternate;u!==null&&(u.return=null),s.return=null}catch(c){Ce(s,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)xE(e,t),e=e.sibling}function xE(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(ln(e,t),_n(t),r&4){try{ea(3,t,t.return),kc(3,t)}catch(C){Ce(t,t.return,C)}try{ea(5,t,t.return)}catch(C){Ce(t,t.return,C)}}break;case 1:ln(e,t),_n(t),r&512&&n!==null&&Ei(n,n.return);break;case 5:if(ln(e,t),_n(t),r&512&&n!==null&&Ei(n,n.return),t.flags&32){var s=t.stateNode;try{da(s,"")}catch(C){Ce(t,t.return,C)}}if(r&4&&(s=t.stateNode,s!=null)){var i=t.memoizedProps,o=n!==null?n.memoizedProps:i,l=t.type,u=t.updateQueue;if(t.updateQueue=null,u!==null)try{l==="input"&&i.type==="radio"&&i.name!=null&&H0(s,i),$h(l,o);var c=$h(l,i);for(o=0;o<u.length;o+=2){var f=u[o],m=u[o+1];f==="style"?Y0(s,m):f==="dangerouslySetInnerHTML"?K0(s,m):f==="children"?da(s,m):cp(s,f,m,c)}switch(l){case"input":Lh(s,i);break;case"textarea":q0(s,i);break;case"select":var g=s._wrapperState.wasMultiple;s._wrapperState.wasMultiple=!!i.multiple;var x=i.value;x!=null?xi(s,!!i.multiple,x,!1):g!==!!i.multiple&&(i.defaultValue!=null?xi(s,!!i.multiple,i.defaultValue,!0):xi(s,!!i.multiple,i.multiple?[]:"",!1))}s[wa]=i}catch(C){Ce(t,t.return,C)}}break;case 6:if(ln(e,t),_n(t),r&4){if(t.stateNode===null)throw Error(U(162));s=t.stateNode,i=t.memoizedProps;try{s.nodeValue=i}catch(C){Ce(t,t.return,C)}}break;case 3:if(ln(e,t),_n(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{ma(e.containerInfo)}catch(C){Ce(t,t.return,C)}break;case 4:ln(e,t),_n(t);break;case 13:ln(e,t),_n(t),s=t.child,s.flags&8192&&(i=s.memoizedState!==null,s.stateNode.isHidden=i,!i||s.alternate!==null&&s.alternate.memoizedState!==null||(zp=Oe())),r&4&&sv(t);break;case 22:if(f=n!==null&&n.memoizedState!==null,t.mode&1?(ct=(c=ct)||f,ln(e,t),ct=c):ln(e,t),_n(t),r&8192){if(c=t.memoizedState!==null,(t.stateNode.isHidden=c)&&!f&&t.mode&1)for(q=t,f=t.child;f!==null;){for(m=q=f;q!==null;){switch(g=q,x=g.child,g.tag){case 0:case 11:case 14:case 15:ea(4,g,g.return);break;case 1:Ei(g,g.return);var A=g.stateNode;if(typeof A.componentWillUnmount=="function"){r=g,n=g.return;try{e=r,A.props=e.memoizedProps,A.state=e.memoizedState,A.componentWillUnmount()}catch(C){Ce(r,n,C)}}break;case 5:Ei(g,g.return);break;case 22:if(g.memoizedState!==null){ov(m);continue}}x!==null?(x.return=g,q=x):ov(m)}f=f.sibling}e:for(f=null,m=t;;){if(m.tag===5){if(f===null){f=m;try{s=m.stateNode,c?(i=s.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"):(l=m.stateNode,u=m.memoizedProps.style,o=u!=null&&u.hasOwnProperty("display")?u.display:null,l.style.display=Q0("display",o))}catch(C){Ce(t,t.return,C)}}}else if(m.tag===6){if(f===null)try{m.stateNode.nodeValue=c?"":m.memoizedProps}catch(C){Ce(t,t.return,C)}}else if((m.tag!==22&&m.tag!==23||m.memoizedState===null||m===t)&&m.child!==null){m.child.return=m,m=m.child;continue}if(m===t)break e;for(;m.sibling===null;){if(m.return===null||m.return===t)break e;f===m&&(f=null),m=m.return}f===m&&(f=null),m.sibling.return=m.return,m=m.sibling}}break;case 19:ln(e,t),_n(t),r&4&&sv(t);break;case 21:break;default:ln(e,t),_n(t)}}function _n(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(EE(n)){var r=n;break e}n=n.return}throw Error(U(160))}switch(r.tag){case 5:var s=r.stateNode;r.flags&32&&(da(s,""),r.flags&=-33);var i=rv(t);_f(t,i,s);break;case 3:case 4:var o=r.stateNode.containerInfo,l=rv(t);vf(t,l,o);break;default:throw Error(U(161))}}catch(u){Ce(t,t.return,u)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function dk(t,e,n){q=t,IE(t)}function IE(t,e,n){for(var r=(t.mode&1)!==0;q!==null;){var s=q,i=s.child;if(s.tag===22&&r){var o=s.memoizedState!==null||Ul;if(!o){var l=s.alternate,u=l!==null&&l.memoizedState!==null||ct;l=Ul;var c=ct;if(Ul=o,(ct=u)&&!c)for(q=s;q!==null;)o=q,u=o.child,o.tag===22&&o.memoizedState!==null?av(s):u!==null?(u.return=o,q=u):av(s);for(;i!==null;)q=i,IE(i),i=i.sibling;q=s,Ul=l,ct=c}iv(t)}else s.subtreeFlags&8772&&i!==null?(i.return=s,q=i):iv(t)}}function iv(t){for(;q!==null;){var e=q;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:ct||kc(5,e);break;case 1:var r=e.stateNode;if(e.flags&4&&!ct)if(n===null)r.componentDidMount();else{var s=e.elementType===e.type?n.memoizedProps:un(e.type,n.memoizedProps);r.componentDidUpdate(s,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var i=e.updateQueue;i!==null&&zy(e,i,r);break;case 3:var o=e.updateQueue;if(o!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}zy(e,o,n)}break;case 5:var l=e.stateNode;if(n===null&&e.flags&4){n=l;var u=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var f=c.memoizedState;if(f!==null){var m=f.dehydrated;m!==null&&ma(m)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(U(163))}ct||e.flags&512&&yf(e)}catch(g){Ce(e,e.return,g)}}if(e===t){q=null;break}if(n=e.sibling,n!==null){n.return=e.return,q=n;break}q=e.return}}function ov(t){for(;q!==null;){var e=q;if(e===t){q=null;break}var n=e.sibling;if(n!==null){n.return=e.return,q=n;break}q=e.return}}function av(t){for(;q!==null;){var e=q;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{kc(4,e)}catch(u){Ce(e,n,u)}break;case 1:var r=e.stateNode;if(typeof r.componentDidMount=="function"){var s=e.return;try{r.componentDidMount()}catch(u){Ce(e,s,u)}}var i=e.return;try{yf(e)}catch(u){Ce(e,i,u)}break;case 5:var o=e.return;try{yf(e)}catch(u){Ce(e,o,u)}}}catch(u){Ce(e,e.return,u)}if(e===t){q=null;break}var l=e.sibling;if(l!==null){l.return=e.return,q=l;break}q=e.return}}var hk=Math.ceil,$u=ir.ReactCurrentDispatcher,Bp=ir.ReactCurrentOwner,Yt=ir.ReactCurrentBatchConfig,le=0,Ke=null,Le=null,Ze=0,Lt=0,Ti=Jr(0),ze=0,Aa=null,Ds=0,bc=0,$p=0,ta=null,bt=null,zp=0,Ui=1/0,Fn=null,zu=!1,wf=null,Or=null,Bl=!1,Ar=null,Wu=0,na=0,Ef=null,lu=-1,uu=0;function xt(){return le&6?Oe():lu!==-1?lu:lu=Oe()}function Mr(t){return t.mode&1?le&2&&Ze!==0?Ze&-Ze:QA.transition!==null?(uu===0&&(uu=lw()),uu):(t=fe,t!==0||(t=window.event,t=t===void 0?16:mw(t.type)),t):1}function pn(t,e,n,r){if(50<na)throw na=0,Ef=null,Error(U(185));Wa(t,n,r),(!(le&2)||t!==Ke)&&(t===Ke&&(!(le&2)&&(bc|=n),ze===4&&wr(t,Ze)),Mt(t,r),n===1&&le===0&&!(e.mode&1)&&(Ui=Oe()+500,Ic&&Zr()))}function Mt(t,e){var n=t.callbackNode;QS(t,e);var r=ku(t,t===Ke?Ze:0);if(r===0)n!==null&&gy(n),t.callbackNode=null,t.callbackPriority=0;else if(e=r&-r,t.callbackPriority!==e){if(n!=null&&gy(n),e===1)t.tag===0?KA(lv.bind(null,t)):Ow(lv.bind(null,t)),WA(function(){!(le&6)&&Zr()}),n=null;else{switch(uw(r)){case 1:n=mp;break;case 4:n=ow;break;case 16:n=Au;break;case 536870912:n=aw;break;default:n=Au}n=PE(n,SE.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function SE(t,e){if(lu=-1,uu=0,le&6)throw Error(U(327));var n=t.callbackNode;if(bi()&&t.callbackNode!==n)return null;var r=ku(t,t===Ke?Ze:0);if(r===0)return null;if(r&30||r&t.expiredLanes||e)e=Hu(t,r);else{e=r;var s=le;le|=2;var i=kE();(Ke!==t||Ze!==e)&&(Fn=null,Ui=Oe()+500,Is(t,e));do try{mk();break}catch(l){AE(t,l)}while(!0);bp(),$u.current=i,le=s,Le!==null?e=0:(Ke=null,Ze=0,e=ze)}if(e!==0){if(e===2&&(s=Gh(t),s!==0&&(r=s,e=Tf(t,s))),e===1)throw n=Aa,Is(t,0),wr(t,r),Mt(t,Oe()),n;if(e===6)wr(t,r);else{if(s=t.current.alternate,!(r&30)&&!fk(s)&&(e=Hu(t,r),e===2&&(i=Gh(t),i!==0&&(r=i,e=Tf(t,i))),e===1))throw n=Aa,Is(t,0),wr(t,r),Mt(t,Oe()),n;switch(t.finishedWork=s,t.finishedLanes=r,e){case 0:case 1:throw Error(U(345));case 2:ps(t,bt,Fn);break;case 3:if(wr(t,r),(r&130023424)===r&&(e=zp+500-Oe(),10<e)){if(ku(t,0)!==0)break;if(s=t.suspendedLanes,(s&r)!==r){xt(),t.pingedLanes|=t.suspendedLanes&s;break}t.timeoutHandle=tf(ps.bind(null,t,bt,Fn),e);break}ps(t,bt,Fn);break;case 4:if(wr(t,r),(r&4194240)===r)break;for(e=t.eventTimes,s=-1;0<r;){var o=31-fn(r);i=1<<o,o=e[o],o>s&&(s=o),r&=~i}if(r=s,r=Oe()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*hk(r/1960))-r,10<r){t.timeoutHandle=tf(ps.bind(null,t,bt,Fn),r);break}ps(t,bt,Fn);break;case 5:ps(t,bt,Fn);break;default:throw Error(U(329))}}}return Mt(t,Oe()),t.callbackNode===n?SE.bind(null,t):null}function Tf(t,e){var n=ta;return t.current.memoizedState.isDehydrated&&(Is(t,e).flags|=256),t=Hu(t,e),t!==2&&(e=bt,bt=n,e!==null&&xf(e)),t}function xf(t){bt===null?bt=t:bt.push.apply(bt,t)}function fk(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var s=n[r],i=s.getSnapshot;s=s.value;try{if(!gn(i(),s))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function wr(t,e){for(e&=~$p,e&=~bc,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-fn(e),r=1<<n;t[n]=-1,e&=~r}}function lv(t){if(le&6)throw Error(U(327));bi();var e=ku(t,0);if(!(e&1))return Mt(t,Oe()),null;var n=Hu(t,e);if(t.tag!==0&&n===2){var r=Gh(t);r!==0&&(e=r,n=Tf(t,r))}if(n===1)throw n=Aa,Is(t,0),wr(t,e),Mt(t,Oe()),n;if(n===6)throw Error(U(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,ps(t,bt,Fn),Mt(t,Oe()),null}function Wp(t,e){var n=le;le|=1;try{return t(e)}finally{le=n,le===0&&(Ui=Oe()+500,Ic&&Zr())}}function Os(t){Ar!==null&&Ar.tag===0&&!(le&6)&&bi();var e=le;le|=1;var n=Yt.transition,r=fe;try{if(Yt.transition=null,fe=1,t)return t()}finally{fe=r,Yt.transition=n,le=e,!(le&6)&&Zr()}}function Hp(){Lt=Ti.current,Ee(Ti)}function Is(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,zA(n)),Le!==null)for(n=Le.return;n!==null;){var r=n;switch(Sp(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&Pu();break;case 3:Vi(),Ee(Dt),Ee(mt),Op();break;case 5:Dp(r);break;case 4:Vi();break;case 13:Ee(Ie);break;case 19:Ee(Ie);break;case 10:Cp(r.type._context);break;case 22:case 23:Hp()}n=n.return}if(Ke=t,Le=t=jr(t.current,null),Ze=Lt=e,ze=0,Aa=null,$p=bc=Ds=0,bt=ta=null,_s!==null){for(e=0;e<_s.length;e++)if(n=_s[e],r=n.interleaved,r!==null){n.interleaved=null;var s=r.next,i=n.pending;if(i!==null){var o=i.next;i.next=s,r.next=o}n.pending=r}_s=null}return t}function AE(t,e){do{var n=Le;try{if(bp(),iu.current=Bu,Uu){for(var r=Se.memoizedState;r!==null;){var s=r.queue;s!==null&&(s.pending=null),r=r.next}Uu=!1}if(Ps=0,Ge=$e=Se=null,Zo=!1,xa=0,Bp.current=null,n===null||n.return===null){ze=1,Aa=e,Le=null;break}e:{var i=t,o=n.return,l=n,u=e;if(e=Ze,l.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var c=u,f=l,m=f.tag;if(!(f.mode&1)&&(m===0||m===11||m===15)){var g=f.alternate;g?(f.updateQueue=g.updateQueue,f.memoizedState=g.memoizedState,f.lanes=g.lanes):(f.updateQueue=null,f.memoizedState=null)}var x=Qy(o);if(x!==null){x.flags&=-257,Yy(x,o,l,i,e),x.mode&1&&Ky(i,c,e),e=x,u=c;var A=e.updateQueue;if(A===null){var C=new Set;C.add(u),e.updateQueue=C}else A.add(u);break e}else{if(!(e&1)){Ky(i,c,e),qp();break e}u=Error(U(426))}}else if(Te&&l.mode&1){var N=Qy(o);if(N!==null){!(N.flags&65536)&&(N.flags|=256),Yy(N,o,l,i,e),Ap(Fi(u,l));break e}}i=u=Fi(u,l),ze!==4&&(ze=2),ta===null?ta=[i]:ta.push(i),i=o;do{switch(i.tag){case 3:i.flags|=65536,e&=-e,i.lanes|=e;var E=uE(i,u,e);$y(i,E);break e;case 1:l=u;var y=i.type,_=i.stateNode;if(!(i.flags&128)&&(typeof y.getDerivedStateFromError=="function"||_!==null&&typeof _.componentDidCatch=="function"&&(Or===null||!Or.has(_)))){i.flags|=65536,e&=-e,i.lanes|=e;var R=cE(i,l,e);$y(i,R);break e}}i=i.return}while(i!==null)}CE(n)}catch(V){e=V,Le===n&&n!==null&&(Le=n=n.return);continue}break}while(!0)}function kE(){var t=$u.current;return $u.current=Bu,t===null?Bu:t}function qp(){(ze===0||ze===3||ze===2)&&(ze=4),Ke===null||!(Ds&268435455)&&!(bc&268435455)||wr(Ke,Ze)}function Hu(t,e){var n=le;le|=2;var r=kE();(Ke!==t||Ze!==e)&&(Fn=null,Is(t,e));do try{pk();break}catch(s){AE(t,s)}while(!0);if(bp(),le=n,$u.current=r,Le!==null)throw Error(U(261));return Ke=null,Ze=0,ze}function pk(){for(;Le!==null;)bE(Le)}function mk(){for(;Le!==null&&!US();)bE(Le)}function bE(t){var e=RE(t.alternate,t,Lt);t.memoizedProps=t.pendingProps,e===null?CE(t):Le=e,Bp.current=null}function CE(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=lk(n,e),n!==null){n.flags&=32767,Le=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{ze=6,Le=null;return}}else if(n=ak(n,e,Lt),n!==null){Le=n;return}if(e=e.sibling,e!==null){Le=e;return}Le=e=t}while(e!==null);ze===0&&(ze=5)}function ps(t,e,n){var r=fe,s=Yt.transition;try{Yt.transition=null,fe=1,gk(t,e,n,r)}finally{Yt.transition=s,fe=r}return null}function gk(t,e,n,r){do bi();while(Ar!==null);if(le&6)throw Error(U(327));n=t.finishedWork;var s=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(U(177));t.callbackNode=null,t.callbackPriority=0;var i=n.lanes|n.childLanes;if(YS(t,i),t===Ke&&(Le=Ke=null,Ze=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Bl||(Bl=!0,PE(Au,function(){return bi(),null})),i=(n.flags&15990)!==0,n.subtreeFlags&15990||i){i=Yt.transition,Yt.transition=null;var o=fe;fe=1;var l=le;le|=4,Bp.current=null,ck(t,n),xE(n,t),jA(Zh),bu=!!Jh,Zh=Jh=null,t.current=n,dk(n),BS(),le=l,fe=o,Yt.transition=i}else t.current=n;if(Bl&&(Bl=!1,Ar=t,Wu=s),i=t.pendingLanes,i===0&&(Or=null),WS(n.stateNode),Mt(t,Oe()),e!==null)for(r=t.onRecoverableError,n=0;n<e.length;n++)s=e[n],r(s.value,{componentStack:s.stack,digest:s.digest});if(zu)throw zu=!1,t=wf,wf=null,t;return Wu&1&&t.tag!==0&&bi(),i=t.pendingLanes,i&1?t===Ef?na++:(na=0,Ef=t):na=0,Zr(),null}function bi(){if(Ar!==null){var t=uw(Wu),e=Yt.transition,n=fe;try{if(Yt.transition=null,fe=16>t?16:t,Ar===null)var r=!1;else{if(t=Ar,Ar=null,Wu=0,le&6)throw Error(U(331));var s=le;for(le|=4,q=t.current;q!==null;){var i=q,o=i.child;if(q.flags&16){var l=i.deletions;if(l!==null){for(var u=0;u<l.length;u++){var c=l[u];for(q=c;q!==null;){var f=q;switch(f.tag){case 0:case 11:case 15:ea(8,f,i)}var m=f.child;if(m!==null)m.return=f,q=m;else for(;q!==null;){f=q;var g=f.sibling,x=f.return;if(wE(f),f===c){q=null;break}if(g!==null){g.return=x,q=g;break}q=x}}}var A=i.alternate;if(A!==null){var C=A.child;if(C!==null){A.child=null;do{var N=C.sibling;C.sibling=null,C=N}while(C!==null)}}q=i}}if(i.subtreeFlags&2064&&o!==null)o.return=i,q=o;else e:for(;q!==null;){if(i=q,i.flags&2048)switch(i.tag){case 0:case 11:case 15:ea(9,i,i.return)}var E=i.sibling;if(E!==null){E.return=i.return,q=E;break e}q=i.return}}var y=t.current;for(q=y;q!==null;){o=q;var _=o.child;if(o.subtreeFlags&2064&&_!==null)_.return=o,q=_;else e:for(o=y;q!==null;){if(l=q,l.flags&2048)try{switch(l.tag){case 0:case 11:case 15:kc(9,l)}}catch(V){Ce(l,l.return,V)}if(l===o){q=null;break e}var R=l.sibling;if(R!==null){R.return=l.return,q=R;break e}q=l.return}}if(le=s,Zr(),An&&typeof An.onPostCommitFiberRoot=="function")try{An.onPostCommitFiberRoot(_c,t)}catch{}r=!0}return r}finally{fe=n,Yt.transition=e}}return!1}function uv(t,e,n){e=Fi(n,e),e=uE(t,e,1),t=Dr(t,e,1),e=xt(),t!==null&&(Wa(t,1,e),Mt(t,e))}function Ce(t,e,n){if(t.tag===3)uv(t,t,n);else for(;e!==null;){if(e.tag===3){uv(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Or===null||!Or.has(r))){t=Fi(n,t),t=cE(e,t,1),e=Dr(e,t,1),t=xt(),e!==null&&(Wa(e,1,t),Mt(e,t));break}}e=e.return}}function yk(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),e=xt(),t.pingedLanes|=t.suspendedLanes&n,Ke===t&&(Ze&n)===n&&(ze===4||ze===3&&(Ze&130023424)===Ze&&500>Oe()-zp?Is(t,0):$p|=n),Mt(t,e)}function NE(t,e){e===0&&(t.mode&1?(e=Rl,Rl<<=1,!(Rl&130023424)&&(Rl=4194304)):e=1);var n=xt();t=Zn(t,e),t!==null&&(Wa(t,e,n),Mt(t,n))}function vk(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),NE(t,n)}function _k(t,e){var n=0;switch(t.tag){case 13:var r=t.stateNode,s=t.memoizedState;s!==null&&(n=s.retryLane);break;case 19:r=t.stateNode;break;default:throw Error(U(314))}r!==null&&r.delete(e),NE(t,n)}var RE;RE=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||Dt.current)Rt=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return Rt=!1,ok(t,e,n);Rt=!!(t.flags&131072)}else Rt=!1,Te&&e.flags&1048576&&Mw(e,Mu,e.index);switch(e.lanes=0,e.tag){case 2:var r=e.type;au(t,e),t=e.pendingProps;var s=Mi(e,mt.current);ki(e,n),s=jp(null,e,r,t,s,n);var i=Lp();return e.flags|=1,typeof s=="object"&&s!==null&&typeof s.render=="function"&&s.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,Ot(r)?(i=!0,Du(e)):i=!1,e.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,Rp(e),s.updater=Ac,e.stateNode=s,s._reactInternals=e,uf(e,r,t,n),e=hf(null,e,r,!0,i,n)):(e.tag=0,Te&&i&&Ip(e),Et(null,e,s,n),e=e.child),e;case 16:r=e.elementType;e:{switch(au(t,e),t=e.pendingProps,s=r._init,r=s(r._payload),e.type=r,s=e.tag=Ek(r),t=un(r,t),s){case 0:e=df(null,e,r,t,n);break e;case 1:e=Zy(null,e,r,t,n);break e;case 11:e=Xy(null,e,r,t,n);break e;case 14:e=Jy(null,e,r,un(r.type,t),n);break e}throw Error(U(306,r,""))}return e;case 0:return r=e.type,s=e.pendingProps,s=e.elementType===r?s:un(r,s),df(t,e,r,s,n);case 1:return r=e.type,s=e.pendingProps,s=e.elementType===r?s:un(r,s),Zy(t,e,r,s,n);case 3:e:{if(pE(e),t===null)throw Error(U(387));r=e.pendingProps,i=e.memoizedState,s=i.element,Bw(t,e),Vu(e,r,null,n);var o=e.memoizedState;if(r=o.element,i.isDehydrated)if(i={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=i,e.memoizedState=i,e.flags&256){s=Fi(Error(U(423)),e),e=ev(t,e,r,n,s);break e}else if(r!==s){s=Fi(Error(U(424)),e),e=ev(t,e,r,n,s);break e}else for(Vt=Pr(e.stateNode.containerInfo.firstChild),Bt=e,Te=!0,dn=null,n=Fw(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(ji(),r===s){e=er(t,e,n);break e}Et(t,e,r,n)}e=e.child}return e;case 5:return $w(e),t===null&&of(e),r=e.type,s=e.pendingProps,i=t!==null?t.memoizedProps:null,o=s.children,ef(r,s)?o=null:i!==null&&ef(r,i)&&(e.flags|=32),fE(t,e),Et(t,e,o,n),e.child;case 6:return t===null&&of(e),null;case 13:return mE(t,e,n);case 4:return Pp(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=Li(e,null,r,n):Et(t,e,r,n),e.child;case 11:return r=e.type,s=e.pendingProps,s=e.elementType===r?s:un(r,s),Xy(t,e,r,s,n);case 7:return Et(t,e,e.pendingProps,n),e.child;case 8:return Et(t,e,e.pendingProps.children,n),e.child;case 12:return Et(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(r=e.type._context,s=e.pendingProps,i=e.memoizedProps,o=s.value,ye(ju,r._currentValue),r._currentValue=o,i!==null)if(gn(i.value,o)){if(i.children===s.children&&!Dt.current){e=er(t,e,n);break e}}else for(i=e.child,i!==null&&(i.return=e);i!==null;){var l=i.dependencies;if(l!==null){o=i.child;for(var u=l.firstContext;u!==null;){if(u.context===r){if(i.tag===1){u=Kn(-1,n&-n),u.tag=2;var c=i.updateQueue;if(c!==null){c=c.shared;var f=c.pending;f===null?u.next=u:(u.next=f.next,f.next=u),c.pending=u}}i.lanes|=n,u=i.alternate,u!==null&&(u.lanes|=n),af(i.return,n,e),l.lanes|=n;break}u=u.next}}else if(i.tag===10)o=i.type===e.type?null:i.child;else if(i.tag===18){if(o=i.return,o===null)throw Error(U(341));o.lanes|=n,l=o.alternate,l!==null&&(l.lanes|=n),af(o,n,e),o=i.sibling}else o=i.child;if(o!==null)o.return=i;else for(o=i;o!==null;){if(o===e){o=null;break}if(i=o.sibling,i!==null){i.return=o.return,o=i;break}o=o.return}i=o}Et(t,e,s.children,n),e=e.child}return e;case 9:return s=e.type,r=e.pendingProps.children,ki(e,n),s=Jt(s),r=r(s),e.flags|=1,Et(t,e,r,n),e.child;case 14:return r=e.type,s=un(r,e.pendingProps),s=un(r.type,s),Jy(t,e,r,s,n);case 15:return dE(t,e,e.type,e.pendingProps,n);case 17:return r=e.type,s=e.pendingProps,s=e.elementType===r?s:un(r,s),au(t,e),e.tag=1,Ot(r)?(t=!0,Du(e)):t=!1,ki(e,n),lE(e,r,s),uf(e,r,s,n),hf(null,e,r,!0,t,n);case 19:return gE(t,e,n);case 22:return hE(t,e,n)}throw Error(U(156,e.tag))};function PE(t,e){return iw(t,e)}function wk(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Qt(t,e,n,r){return new wk(t,e,n,r)}function Gp(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Ek(t){if(typeof t=="function")return Gp(t)?1:0;if(t!=null){if(t=t.$$typeof,t===hp)return 11;if(t===fp)return 14}return 2}function jr(t,e){var n=t.alternate;return n===null?(n=Qt(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function cu(t,e,n,r,s,i){var o=2;if(r=t,typeof t=="function")Gp(t)&&(o=1);else if(typeof t=="string")o=5;else e:switch(t){case hi:return Ss(n.children,s,i,e);case dp:o=8,s|=8;break;case Ph:return t=Qt(12,n,e,s|2),t.elementType=Ph,t.lanes=i,t;case Dh:return t=Qt(13,n,e,s),t.elementType=Dh,t.lanes=i,t;case Oh:return t=Qt(19,n,e,s),t.elementType=Oh,t.lanes=i,t;case $0:return Cc(n,s,i,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case U0:o=10;break e;case B0:o=9;break e;case hp:o=11;break e;case fp:o=14;break e;case gr:o=16,r=null;break e}throw Error(U(130,t==null?t:typeof t,""))}return e=Qt(o,n,e,s),e.elementType=t,e.type=r,e.lanes=i,e}function Ss(t,e,n,r){return t=Qt(7,t,r,e),t.lanes=n,t}function Cc(t,e,n,r){return t=Qt(22,t,r,e),t.elementType=$0,t.lanes=n,t.stateNode={isHidden:!1},t}function oh(t,e,n){return t=Qt(6,t,null,e),t.lanes=n,t}function ah(t,e,n){return e=Qt(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function Tk(t,e,n,r,s){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Bd(0),this.expirationTimes=Bd(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Bd(0),this.identifierPrefix=r,this.onRecoverableError=s,this.mutableSourceEagerHydrationData=null}function Kp(t,e,n,r,s,i,o,l,u){return t=new Tk(t,e,n,l,u),e===1?(e=1,i===!0&&(e|=8)):e=0,i=Qt(3,null,null,e),t.current=i,i.stateNode=t,i.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Rp(i),t}function xk(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:di,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}function DE(t){if(!t)return zr;t=t._reactInternals;e:{if(qs(t)!==t||t.tag!==1)throw Error(U(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(Ot(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(U(171))}if(t.tag===1){var n=t.type;if(Ot(n))return Dw(t,n,e)}return e}function OE(t,e,n,r,s,i,o,l,u){return t=Kp(n,r,!0,t,s,i,o,l,u),t.context=DE(null),n=t.current,r=xt(),s=Mr(n),i=Kn(r,s),i.callback=e??null,Dr(n,i,s),t.current.lanes=s,Wa(t,s,r),Mt(t,r),t}function Nc(t,e,n,r){var s=e.current,i=xt(),o=Mr(s);return n=DE(n),e.context===null?e.context=n:e.pendingContext=n,e=Kn(i,o),e.payload={element:t},r=r===void 0?null:r,r!==null&&(e.callback=r),t=Dr(s,e,o),t!==null&&(pn(t,s,o,i),su(t,s,o)),o}function qu(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function cv(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Qp(t,e){cv(t,e),(t=t.alternate)&&cv(t,e)}function Ik(){return null}var ME=typeof reportError=="function"?reportError:function(t){console.error(t)};function Yp(t){this._internalRoot=t}Rc.prototype.render=Yp.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(U(409));Nc(t,e,null,null)};Rc.prototype.unmount=Yp.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;Os(function(){Nc(null,t,null,null)}),e[Jn]=null}};function Rc(t){this._internalRoot=t}Rc.prototype.unstable_scheduleHydration=function(t){if(t){var e=hw();t={blockedOn:null,target:t,priority:e};for(var n=0;n<_r.length&&e!==0&&e<_r[n].priority;n++);_r.splice(n,0,t),n===0&&pw(t)}};function Xp(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Pc(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function dv(){}function Sk(t,e,n,r,s){if(s){if(typeof r=="function"){var i=r;r=function(){var c=qu(o);i.call(c)}}var o=OE(e,r,t,0,null,!1,!1,"",dv);return t._reactRootContainer=o,t[Jn]=o.current,va(t.nodeType===8?t.parentNode:t),Os(),o}for(;s=t.lastChild;)t.removeChild(s);if(typeof r=="function"){var l=r;r=function(){var c=qu(u);l.call(c)}}var u=Kp(t,0,!1,null,null,!1,!1,"",dv);return t._reactRootContainer=u,t[Jn]=u.current,va(t.nodeType===8?t.parentNode:t),Os(function(){Nc(e,u,n,r)}),u}function Dc(t,e,n,r,s){var i=n._reactRootContainer;if(i){var o=i;if(typeof s=="function"){var l=s;s=function(){var u=qu(o);l.call(u)}}Nc(e,o,t,s)}else o=Sk(n,e,t,s,r);return qu(o)}cw=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=Fo(e.pendingLanes);n!==0&&(gp(e,n|1),Mt(e,Oe()),!(le&6)&&(Ui=Oe()+500,Zr()))}break;case 13:Os(function(){var r=Zn(t,1);if(r!==null){var s=xt();pn(r,t,1,s)}}),Qp(t,1)}};yp=function(t){if(t.tag===13){var e=Zn(t,134217728);if(e!==null){var n=xt();pn(e,t,134217728,n)}Qp(t,134217728)}};dw=function(t){if(t.tag===13){var e=Mr(t),n=Zn(t,e);if(n!==null){var r=xt();pn(n,t,e,r)}Qp(t,e)}};hw=function(){return fe};fw=function(t,e){var n=fe;try{return fe=t,e()}finally{fe=n}};Wh=function(t,e,n){switch(e){case"input":if(Lh(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var s=xc(r);if(!s)throw Error(U(90));W0(r),Lh(r,s)}}}break;case"textarea":q0(t,n);break;case"select":e=n.value,e!=null&&xi(t,!!n.multiple,e,!1)}};Z0=Wp;ew=Os;var Ak={usingClientEntryPoint:!1,Events:[qa,gi,xc,X0,J0,Wp]},Ro={findFiberByHostInstance:vs,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},kk={bundleType:Ro.bundleType,version:Ro.version,rendererPackageName:Ro.rendererPackageName,rendererConfig:Ro.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:ir.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=rw(t),t===null?null:t.stateNode},findFiberByHostInstance:Ro.findFiberByHostInstance||Ik,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var $l=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!$l.isDisabled&&$l.supportsFiber)try{_c=$l.inject(kk),An=$l}catch{}}Wt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Ak;Wt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Xp(e))throw Error(U(200));return xk(t,e,null,n)};Wt.createRoot=function(t,e){if(!Xp(t))throw Error(U(299));var n=!1,r="",s=ME;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onRecoverableError!==void 0&&(s=e.onRecoverableError)),e=Kp(t,1,!1,null,null,n,!1,r,s),t[Jn]=e.current,va(t.nodeType===8?t.parentNode:t),new Yp(e)};Wt.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(U(188)):(t=Object.keys(t).join(","),Error(U(268,t)));return t=rw(e),t=t===null?null:t.stateNode,t};Wt.flushSync=function(t){return Os(t)};Wt.hydrate=function(t,e,n){if(!Pc(e))throw Error(U(200));return Dc(null,t,e,!0,n)};Wt.hydrateRoot=function(t,e,n){if(!Xp(t))throw Error(U(405));var r=n!=null&&n.hydratedSources||null,s=!1,i="",o=ME;if(n!=null&&(n.unstable_strictMode===!0&&(s=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),e=OE(e,null,t,1,n??null,s,!1,i,o),t[Jn]=e.current,va(t),r)for(t=0;t<r.length;t++)n=r[t],s=n._getVersion,s=s(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,s]:e.mutableSourceEagerHydrationData.push(n,s);return new Rc(e)};Wt.render=function(t,e,n){if(!Pc(e))throw Error(U(200));return Dc(null,t,e,!1,n)};Wt.unmountComponentAtNode=function(t){if(!Pc(t))throw Error(U(40));return t._reactRootContainer?(Os(function(){Dc(null,null,t,!1,function(){t._reactRootContainer=null,t[Jn]=null})}),!0):!1};Wt.unstable_batchedUpdates=Wp;Wt.unstable_renderSubtreeIntoContainer=function(t,e,n,r){if(!Pc(n))throw Error(U(200));if(t==null||t._reactInternals===void 0)throw Error(U(38));return Dc(t,e,n,!1,r)};Wt.version="18.3.1-next-f1338f8080-20240426";function jE(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(jE)}catch(t){console.error(t)}}jE(),j0.exports=Wt;var bk=j0.exports,hv=bk;Nh.createRoot=hv.createRoot,Nh.hydrateRoot=hv.hydrateRoot;/**
 * @remix-run/router v1.23.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function ka(){return ka=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},ka.apply(this,arguments)}var kr;(function(t){t.Pop="POP",t.Push="PUSH",t.Replace="REPLACE"})(kr||(kr={}));const fv="popstate";function Ck(t){t===void 0&&(t={});function e(r,s){let{pathname:i,search:o,hash:l}=r.location;return If("",{pathname:i,search:o,hash:l},s.state&&s.state.usr||null,s.state&&s.state.key||"default")}function n(r,s){return typeof s=="string"?s:Gu(s)}return Rk(e,n,null,t)}function Ne(t,e){if(t===!1||t===null||typeof t>"u")throw new Error(e)}function LE(t,e){if(!t){typeof console<"u"&&console.warn(e);try{throw new Error(e)}catch{}}}function Nk(){return Math.random().toString(36).substr(2,8)}function pv(t,e){return{usr:t.state,key:t.key,idx:e}}function If(t,e,n,r){return n===void 0&&(n=null),ka({pathname:typeof t=="string"?t:t.pathname,search:"",hash:""},typeof e=="string"?Zi(e):e,{state:n,key:e&&e.key||r||Nk()})}function Gu(t){let{pathname:e="/",search:n="",hash:r=""}=t;return n&&n!=="?"&&(e+=n.charAt(0)==="?"?n:"?"+n),r&&r!=="#"&&(e+=r.charAt(0)==="#"?r:"#"+r),e}function Zi(t){let e={};if(t){let n=t.indexOf("#");n>=0&&(e.hash=t.substr(n),t=t.substr(0,n));let r=t.indexOf("?");r>=0&&(e.search=t.substr(r),t=t.substr(0,r)),t&&(e.pathname=t)}return e}function Rk(t,e,n,r){r===void 0&&(r={});let{window:s=document.defaultView,v5Compat:i=!1}=r,o=s.history,l=kr.Pop,u=null,c=f();c==null&&(c=0,o.replaceState(ka({},o.state,{idx:c}),""));function f(){return(o.state||{idx:null}).idx}function m(){l=kr.Pop;let N=f(),E=N==null?null:N-c;c=N,u&&u({action:l,location:C.location,delta:E})}function g(N,E){l=kr.Push;let y=If(C.location,N,E);c=f()+1;let _=pv(y,c),R=C.createHref(y);try{o.pushState(_,"",R)}catch(V){if(V instanceof DOMException&&V.name==="DataCloneError")throw V;s.location.assign(R)}i&&u&&u({action:l,location:C.location,delta:1})}function x(N,E){l=kr.Replace;let y=If(C.location,N,E);c=f();let _=pv(y,c),R=C.createHref(y);o.replaceState(_,"",R),i&&u&&u({action:l,location:C.location,delta:0})}function A(N){let E=s.location.origin!=="null"?s.location.origin:s.location.href,y=typeof N=="string"?N:Gu(N);return y=y.replace(/ $/,"%20"),Ne(E,"No window.location.(origin|href) available to create URL for href: "+y),new URL(y,E)}let C={get action(){return l},get location(){return t(s,o)},listen(N){if(u)throw new Error("A history only accepts one active listener");return s.addEventListener(fv,m),u=N,()=>{s.removeEventListener(fv,m),u=null}},createHref(N){return e(s,N)},createURL:A,encodeLocation(N){let E=A(N);return{pathname:E.pathname,search:E.search,hash:E.hash}},push:g,replace:x,go(N){return o.go(N)}};return C}var mv;(function(t){t.data="data",t.deferred="deferred",t.redirect="redirect",t.error="error"})(mv||(mv={}));function Pk(t,e,n){return n===void 0&&(n="/"),Dk(t,e,n)}function Dk(t,e,n,r){let s=typeof e=="string"?Zi(e):e,i=Bi(s.pathname||"/",n);if(i==null)return null;let o=VE(t);Ok(o);let l=null;for(let u=0;l==null&&u<o.length;++u){let c=Hk(i);l=zk(o[u],c)}return l}function VE(t,e,n,r){e===void 0&&(e=[]),n===void 0&&(n=[]),r===void 0&&(r="");let s=(i,o,l)=>{let u={relativePath:l===void 0?i.path||"":l,caseSensitive:i.caseSensitive===!0,childrenIndex:o,route:i};u.relativePath.startsWith("/")&&(Ne(u.relativePath.startsWith(r),'Absolute route path "'+u.relativePath+'" nested under path '+('"'+r+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),u.relativePath=u.relativePath.slice(r.length));let c=Lr([r,u.relativePath]),f=n.concat(u);i.children&&i.children.length>0&&(Ne(i.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+c+'".')),VE(i.children,e,f,c)),!(i.path==null&&!i.index)&&e.push({path:c,score:Bk(c,i.index),routesMeta:f})};return t.forEach((i,o)=>{var l;if(i.path===""||!((l=i.path)!=null&&l.includes("?")))s(i,o);else for(let u of FE(i.path))s(i,o,u)}),e}function FE(t){let e=t.split("/");if(e.length===0)return[];let[n,...r]=e,s=n.endsWith("?"),i=n.replace(/\?$/,"");if(r.length===0)return s?[i,""]:[i];let o=FE(r.join("/")),l=[];return l.push(...o.map(u=>u===""?i:[i,u].join("/"))),s&&l.push(...o),l.map(u=>t.startsWith("/")&&u===""?"/":u)}function Ok(t){t.sort((e,n)=>e.score!==n.score?n.score-e.score:$k(e.routesMeta.map(r=>r.childrenIndex),n.routesMeta.map(r=>r.childrenIndex)))}const Mk=/^:[\w-]+$/,jk=3,Lk=2,Vk=1,Fk=10,Uk=-2,gv=t=>t==="*";function Bk(t,e){let n=t.split("/"),r=n.length;return n.some(gv)&&(r+=Uk),e&&(r+=Lk),n.filter(s=>!gv(s)).reduce((s,i)=>s+(Mk.test(i)?jk:i===""?Vk:Fk),r)}function $k(t,e){return t.length===e.length&&t.slice(0,-1).every((r,s)=>r===e[s])?t[t.length-1]-e[e.length-1]:0}function zk(t,e,n){let{routesMeta:r}=t,s={},i="/",o=[];for(let l=0;l<r.length;++l){let u=r[l],c=l===r.length-1,f=i==="/"?e:e.slice(i.length)||"/",m=Sf({path:u.relativePath,caseSensitive:u.caseSensitive,end:c},f),g=u.route;if(!m)return null;Object.assign(s,m.params),o.push({params:s,pathname:Lr([i,m.pathname]),pathnameBase:Qk(Lr([i,m.pathnameBase])),route:g}),m.pathnameBase!=="/"&&(i=Lr([i,m.pathnameBase]))}return o}function Sf(t,e){typeof t=="string"&&(t={path:t,caseSensitive:!1,end:!0});let[n,r]=Wk(t.path,t.caseSensitive,t.end),s=e.match(n);if(!s)return null;let i=s[0],o=i.replace(/(.)\/+$/,"$1"),l=s.slice(1);return{params:r.reduce((c,f,m)=>{let{paramName:g,isOptional:x}=f;if(g==="*"){let C=l[m]||"";o=i.slice(0,i.length-C.length).replace(/(.)\/+$/,"$1")}const A=l[m];return x&&!A?c[g]=void 0:c[g]=(A||"").replace(/%2F/g,"/"),c},{}),pathname:i,pathnameBase:o,pattern:t}}function Wk(t,e,n){e===void 0&&(e=!1),n===void 0&&(n=!0),LE(t==="*"||!t.endsWith("*")||t.endsWith("/*"),'Route path "'+t+'" will be treated as if it were '+('"'+t.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+t.replace(/\*$/,"/*")+'".'));let r=[],s="^"+t.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(o,l,u)=>(r.push({paramName:l,isOptional:u!=null}),u?"/?([^\\/]+)?":"/([^\\/]+)"));return t.endsWith("*")?(r.push({paramName:"*"}),s+=t==="*"||t==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):n?s+="\\/*$":t!==""&&t!=="/"&&(s+="(?:(?=\\/|$))"),[new RegExp(s,e?void 0:"i"),r]}function Hk(t){try{return t.split("/").map(e=>decodeURIComponent(e).replace(/\//g,"%2F")).join("/")}catch(e){return LE(!1,'The URL path "'+t+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+e+").")),t}}function Bi(t,e){if(e==="/")return t;if(!t.toLowerCase().startsWith(e.toLowerCase()))return null;let n=e.endsWith("/")?e.length-1:e.length,r=t.charAt(n);return r&&r!=="/"?null:t.slice(n)||"/"}function qk(t,e){e===void 0&&(e="/");let{pathname:n,search:r="",hash:s=""}=typeof t=="string"?Zi(t):t;return{pathname:n?n.startsWith("/")?n:Gk(n,e):e,search:Yk(r),hash:Xk(s)}}function Gk(t,e){let n=e.replace(/\/+$/,"").split("/");return t.split("/").forEach(s=>{s===".."?n.length>1&&n.pop():s!=="."&&n.push(s)}),n.length>1?n.join("/"):"/"}function lh(t,e,n,r){return"Cannot include a '"+t+"' character in a manually specified "+("`to."+e+"` field ["+JSON.stringify(r)+"].  Please separate it out to the ")+("`to."+n+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function Kk(t){return t.filter((e,n)=>n===0||e.route.path&&e.route.path.length>0)}function UE(t,e){let n=Kk(t);return e?n.map((r,s)=>s===n.length-1?r.pathname:r.pathnameBase):n.map(r=>r.pathnameBase)}function BE(t,e,n,r){r===void 0&&(r=!1);let s;typeof t=="string"?s=Zi(t):(s=ka({},t),Ne(!s.pathname||!s.pathname.includes("?"),lh("?","pathname","search",s)),Ne(!s.pathname||!s.pathname.includes("#"),lh("#","pathname","hash",s)),Ne(!s.search||!s.search.includes("#"),lh("#","search","hash",s)));let i=t===""||s.pathname==="",o=i?"/":s.pathname,l;if(o==null)l=n;else{let m=e.length-1;if(!r&&o.startsWith("..")){let g=o.split("/");for(;g[0]==="..";)g.shift(),m-=1;s.pathname=g.join("/")}l=m>=0?e[m]:"/"}let u=qk(s,l),c=o&&o!=="/"&&o.endsWith("/"),f=(i||o===".")&&n.endsWith("/");return!u.pathname.endsWith("/")&&(c||f)&&(u.pathname+="/"),u}const Lr=t=>t.join("/").replace(/\/\/+/g,"/"),Qk=t=>t.replace(/\/+$/,"").replace(/^\/*/,"/"),Yk=t=>!t||t==="?"?"":t.startsWith("?")?t:"?"+t,Xk=t=>!t||t==="#"?"":t.startsWith("#")?t:"#"+t;function Jk(t){return t!=null&&typeof t.status=="number"&&typeof t.statusText=="string"&&typeof t.internal=="boolean"&&"data"in t}const $E=["post","put","patch","delete"];new Set($E);const Zk=["get",...$E];new Set(Zk);/**
 * React Router v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function ba(){return ba=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},ba.apply(this,arguments)}const Oc=D.createContext(null),zE=D.createContext(null),es=D.createContext(null),Mc=D.createContext(null),Gs=D.createContext({outlet:null,matches:[],isDataRoute:!1}),WE=D.createContext(null);function eb(t,e){let{relative:n}=e===void 0?{}:e;Ka()||Ne(!1);let{basename:r,navigator:s}=D.useContext(es),{hash:i,pathname:o,search:l}=jc(t,{relative:n}),u=o;return r!=="/"&&(u=o==="/"?r:Lr([r,o])),s.createHref({pathname:u,search:l,hash:i})}function Ka(){return D.useContext(Mc)!=null}function eo(){return Ka()||Ne(!1),D.useContext(Mc).location}function HE(t){D.useContext(es).static||D.useLayoutEffect(t)}function to(){let{isDataRoute:t}=D.useContext(Gs);return t?fb():tb()}function tb(){Ka()||Ne(!1);let t=D.useContext(Oc),{basename:e,future:n,navigator:r}=D.useContext(es),{matches:s}=D.useContext(Gs),{pathname:i}=eo(),o=JSON.stringify(UE(s,n.v7_relativeSplatPath)),l=D.useRef(!1);return HE(()=>{l.current=!0}),D.useCallback(function(c,f){if(f===void 0&&(f={}),!l.current)return;if(typeof c=="number"){r.go(c);return}let m=BE(c,JSON.parse(o),i,f.relative==="path");t==null&&e!=="/"&&(m.pathname=m.pathname==="/"?e:Lr([e,m.pathname])),(f.replace?r.replace:r.push)(m,f.state,f)},[e,r,o,i,t])}function jc(t,e){let{relative:n}=e===void 0?{}:e,{future:r}=D.useContext(es),{matches:s}=D.useContext(Gs),{pathname:i}=eo(),o=JSON.stringify(UE(s,r.v7_relativeSplatPath));return D.useMemo(()=>BE(t,JSON.parse(o),i,n==="path"),[t,o,i,n])}function nb(t,e){return rb(t,e)}function rb(t,e,n,r){Ka()||Ne(!1);let{navigator:s}=D.useContext(es),{matches:i}=D.useContext(Gs),o=i[i.length-1],l=o?o.params:{};o&&o.pathname;let u=o?o.pathnameBase:"/";o&&o.route;let c=eo(),f;if(e){var m;let N=typeof e=="string"?Zi(e):e;u==="/"||(m=N.pathname)!=null&&m.startsWith(u)||Ne(!1),f=N}else f=c;let g=f.pathname||"/",x=g;if(u!=="/"){let N=u.replace(/^\//,"").split("/");x="/"+g.replace(/^\//,"").split("/").slice(N.length).join("/")}let A=Pk(t,{pathname:x}),C=lb(A&&A.map(N=>Object.assign({},N,{params:Object.assign({},l,N.params),pathname:Lr([u,s.encodeLocation?s.encodeLocation(N.pathname).pathname:N.pathname]),pathnameBase:N.pathnameBase==="/"?u:Lr([u,s.encodeLocation?s.encodeLocation(N.pathnameBase).pathname:N.pathnameBase])})),i,n,r);return e&&C?D.createElement(Mc.Provider,{value:{location:ba({pathname:"/",search:"",hash:"",state:null,key:"default"},f),navigationType:kr.Pop}},C):C}function sb(){let t=hb(),e=Jk(t)?t.status+" "+t.statusText:t instanceof Error?t.message:JSON.stringify(t),n=t instanceof Error?t.stack:null,s={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return D.createElement(D.Fragment,null,D.createElement("h2",null,"Unexpected Application Error!"),D.createElement("h3",{style:{fontStyle:"italic"}},e),n?D.createElement("pre",{style:s},n):null,null)}const ib=D.createElement(sb,null);class ob extends D.Component{constructor(e){super(e),this.state={location:e.location,revalidation:e.revalidation,error:e.error}}static getDerivedStateFromError(e){return{error:e}}static getDerivedStateFromProps(e,n){return n.location!==e.location||n.revalidation!=="idle"&&e.revalidation==="idle"?{error:e.error,location:e.location,revalidation:e.revalidation}:{error:e.error!==void 0?e.error:n.error,location:n.location,revalidation:e.revalidation||n.revalidation}}componentDidCatch(e,n){console.error("React Router caught the following error during render",e,n)}render(){return this.state.error!==void 0?D.createElement(Gs.Provider,{value:this.props.routeContext},D.createElement(WE.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function ab(t){let{routeContext:e,match:n,children:r}=t,s=D.useContext(Oc);return s&&s.static&&s.staticContext&&(n.route.errorElement||n.route.ErrorBoundary)&&(s.staticContext._deepestRenderedBoundaryId=n.route.id),D.createElement(Gs.Provider,{value:e},r)}function lb(t,e,n,r){var s;if(e===void 0&&(e=[]),n===void 0&&(n=null),r===void 0&&(r=null),t==null){var i;if(!n)return null;if(n.errors)t=n.matches;else if((i=r)!=null&&i.v7_partialHydration&&e.length===0&&!n.initialized&&n.matches.length>0)t=n.matches;else return null}let o=t,l=(s=n)==null?void 0:s.errors;if(l!=null){let f=o.findIndex(m=>m.route.id&&(l==null?void 0:l[m.route.id])!==void 0);f>=0||Ne(!1),o=o.slice(0,Math.min(o.length,f+1))}let u=!1,c=-1;if(n&&r&&r.v7_partialHydration)for(let f=0;f<o.length;f++){let m=o[f];if((m.route.HydrateFallback||m.route.hydrateFallbackElement)&&(c=f),m.route.id){let{loaderData:g,errors:x}=n,A=m.route.loader&&g[m.route.id]===void 0&&(!x||x[m.route.id]===void 0);if(m.route.lazy||A){u=!0,c>=0?o=o.slice(0,c+1):o=[o[0]];break}}}return o.reduceRight((f,m,g)=>{let x,A=!1,C=null,N=null;n&&(x=l&&m.route.id?l[m.route.id]:void 0,C=m.route.errorElement||ib,u&&(c<0&&g===0?(pb("route-fallback"),A=!0,N=null):c===g&&(A=!0,N=m.route.hydrateFallbackElement||null)));let E=e.concat(o.slice(0,g+1)),y=()=>{let _;return x?_=C:A?_=N:m.route.Component?_=D.createElement(m.route.Component,null):m.route.element?_=m.route.element:_=f,D.createElement(ab,{match:m,routeContext:{outlet:f,matches:E,isDataRoute:n!=null},children:_})};return n&&(m.route.ErrorBoundary||m.route.errorElement||g===0)?D.createElement(ob,{location:n.location,revalidation:n.revalidation,component:C,error:x,children:y(),routeContext:{outlet:null,matches:E,isDataRoute:!0}}):y()},null)}var qE=function(t){return t.UseBlocker="useBlocker",t.UseRevalidator="useRevalidator",t.UseNavigateStable="useNavigate",t}(qE||{}),GE=function(t){return t.UseBlocker="useBlocker",t.UseLoaderData="useLoaderData",t.UseActionData="useActionData",t.UseRouteError="useRouteError",t.UseNavigation="useNavigation",t.UseRouteLoaderData="useRouteLoaderData",t.UseMatches="useMatches",t.UseRevalidator="useRevalidator",t.UseNavigateStable="useNavigate",t.UseRouteId="useRouteId",t}(GE||{});function ub(t){let e=D.useContext(Oc);return e||Ne(!1),e}function cb(t){let e=D.useContext(zE);return e||Ne(!1),e}function db(t){let e=D.useContext(Gs);return e||Ne(!1),e}function KE(t){let e=db(),n=e.matches[e.matches.length-1];return n.route.id||Ne(!1),n.route.id}function hb(){var t;let e=D.useContext(WE),n=cb(),r=KE();return e!==void 0?e:(t=n.errors)==null?void 0:t[r]}function fb(){let{router:t}=ub(qE.UseNavigateStable),e=KE(GE.UseNavigateStable),n=D.useRef(!1);return HE(()=>{n.current=!0}),D.useCallback(function(s,i){i===void 0&&(i={}),n.current&&(typeof s=="number"?t.navigate(s):t.navigate(s,ba({fromRouteId:e},i)))},[t,e])}const yv={};function pb(t,e,n){yv[t]||(yv[t]=!0)}function mb(t,e){t==null||t.v7_startTransition,t==null||t.v7_relativeSplatPath}function wn(t){Ne(!1)}function gb(t){let{basename:e="/",children:n=null,location:r,navigationType:s=kr.Pop,navigator:i,static:o=!1,future:l}=t;Ka()&&Ne(!1);let u=e.replace(/^\/*/,"/"),c=D.useMemo(()=>({basename:u,navigator:i,static:o,future:ba({v7_relativeSplatPath:!1},l)}),[u,l,i,o]);typeof r=="string"&&(r=Zi(r));let{pathname:f="/",search:m="",hash:g="",state:x=null,key:A="default"}=r,C=D.useMemo(()=>{let N=Bi(f,u);return N==null?null:{location:{pathname:N,search:m,hash:g,state:x,key:A},navigationType:s}},[u,f,m,g,x,A,s]);return C==null?null:D.createElement(es.Provider,{value:c},D.createElement(Mc.Provider,{children:n,value:C}))}function yb(t){let{children:e,location:n}=t;return nb(Af(e),n)}new Promise(()=>{});function Af(t,e){e===void 0&&(e=[]);let n=[];return D.Children.forEach(t,(r,s)=>{if(!D.isValidElement(r))return;let i=[...e,s];if(r.type===D.Fragment){n.push.apply(n,Af(r.props.children,i));return}r.type!==wn&&Ne(!1),!r.props.index||!r.props.children||Ne(!1);let o={id:r.props.id||i.join("-"),caseSensitive:r.props.caseSensitive,element:r.props.element,Component:r.props.Component,index:r.props.index,path:r.props.path,loader:r.props.loader,action:r.props.action,errorElement:r.props.errorElement,ErrorBoundary:r.props.ErrorBoundary,hasErrorBoundary:r.props.ErrorBoundary!=null||r.props.errorElement!=null,shouldRevalidate:r.props.shouldRevalidate,handle:r.props.handle,lazy:r.props.lazy};r.props.children&&(o.children=Af(r.props.children,i)),n.push(o)}),n}/**
 * React Router DOM v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Ku(){return Ku=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},Ku.apply(this,arguments)}function QE(t,e){if(t==null)return{};var n={},r=Object.keys(t),s,i;for(i=0;i<r.length;i++)s=r[i],!(e.indexOf(s)>=0)&&(n[s]=t[s]);return n}function vb(t){return!!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)}function _b(t,e){return t.button===0&&(!e||e==="_self")&&!vb(t)}const wb=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],Eb=["aria-current","caseSensitive","className","end","style","to","viewTransition","children"],Tb="6";try{window.__reactRouterVersion=Tb}catch{}const xb=D.createContext({isTransitioning:!1}),Ib="startTransition",vv=yS[Ib];function Sb(t){let{basename:e,children:n,future:r,window:s}=t,i=D.useRef();i.current==null&&(i.current=Ck({window:s,v5Compat:!0}));let o=i.current,[l,u]=D.useState({action:o.action,location:o.location}),{v7_startTransition:c}=r||{},f=D.useCallback(m=>{c&&vv?vv(()=>u(m)):u(m)},[u,c]);return D.useLayoutEffect(()=>o.listen(f),[o,f]),D.useEffect(()=>mb(r),[r]),D.createElement(gb,{basename:e,children:n,location:l.location,navigationType:l.action,navigator:o,future:r})}const Ab=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",kb=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,As=D.forwardRef(function(e,n){let{onClick:r,relative:s,reloadDocument:i,replace:o,state:l,target:u,to:c,preventScrollReset:f,viewTransition:m}=e,g=QE(e,wb),{basename:x}=D.useContext(es),A,C=!1;if(typeof c=="string"&&kb.test(c)&&(A=c,Ab))try{let _=new URL(window.location.href),R=c.startsWith("//")?new URL(_.protocol+c):new URL(c),V=Bi(R.pathname,x);R.origin===_.origin&&V!=null?c=V+R.search+R.hash:C=!0}catch{}let N=eb(c,{relative:s}),E=Cb(c,{replace:o,state:l,target:u,preventScrollReset:f,relative:s,viewTransition:m});function y(_){r&&r(_),_.defaultPrevented||E(_)}return D.createElement("a",Ku({},g,{href:A||N,onClick:C||i?r:y,ref:n,target:u}))}),Po=D.forwardRef(function(e,n){let{"aria-current":r="page",caseSensitive:s=!1,className:i="",end:o=!1,style:l,to:u,viewTransition:c,children:f}=e,m=QE(e,Eb),g=jc(u,{relative:m.relative}),x=eo(),A=D.useContext(zE),{navigator:C,basename:N}=D.useContext(es),E=A!=null&&Nb(g)&&c===!0,y=C.encodeLocation?C.encodeLocation(g).pathname:g.pathname,_=x.pathname,R=A&&A.navigation&&A.navigation.location?A.navigation.location.pathname:null;s||(_=_.toLowerCase(),R=R?R.toLowerCase():null,y=y.toLowerCase()),R&&N&&(R=Bi(R,N)||R);const V=y!=="/"&&y.endsWith("/")?y.length-1:y.length;let j=_===y||!o&&_.startsWith(y)&&_.charAt(V)==="/",I=R!=null&&(R===y||!o&&R.startsWith(y)&&R.charAt(y.length)==="/"),w={isActive:j,isPending:I,isTransitioning:E},S=j?r:void 0,T;typeof i=="function"?T=i(w):T=[i,j?"active":null,I?"pending":null,E?"transitioning":null].filter(Boolean).join(" ");let b=typeof l=="function"?l(w):l;return D.createElement(As,Ku({},m,{"aria-current":S,className:T,ref:n,style:b,to:u,viewTransition:c}),typeof f=="function"?f(w):f)});var kf;(function(t){t.UseScrollRestoration="useScrollRestoration",t.UseSubmit="useSubmit",t.UseSubmitFetcher="useSubmitFetcher",t.UseFetcher="useFetcher",t.useViewTransitionState="useViewTransitionState"})(kf||(kf={}));var _v;(function(t){t.UseFetcher="useFetcher",t.UseFetchers="useFetchers",t.UseScrollRestoration="useScrollRestoration"})(_v||(_v={}));function bb(t){let e=D.useContext(Oc);return e||Ne(!1),e}function Cb(t,e){let{target:n,replace:r,state:s,preventScrollReset:i,relative:o,viewTransition:l}=e===void 0?{}:e,u=to(),c=eo(),f=jc(t,{relative:o});return D.useCallback(m=>{if(_b(m,n)){m.preventDefault();let g=r!==void 0?r:Gu(c)===Gu(f);u(t,{replace:g,state:s,preventScrollReset:i,relative:o,viewTransition:l})}},[c,u,f,r,s,n,t,i,o,l])}function Nb(t,e){e===void 0&&(e={});let n=D.useContext(xb);n==null&&Ne(!1);let{basename:r}=bb(kf.useViewTransitionState),s=jc(t,{relative:e.relative});if(!n.isTransitioning)return!1;let i=Bi(n.currentLocation.pathname,r)||n.currentLocation.pathname,o=Bi(n.nextLocation.pathname,r)||n.nextLocation.pathname;return Sf(s.pathname,o)!=null||Sf(s.pathname,i)!=null}const Rb=()=>{};var wv={};/**
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
 */const YE=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},Pb=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=t[n++],o=t[n++],l=t[n++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=t[n++],o=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},XE={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const i=t[s],o=s+1<t.length,l=o?t[s+1]:0,u=s+2<t.length,c=u?t[s+2]:0,f=i>>2,m=(i&3)<<4|l>>4;let g=(l&15)<<2|c>>6,x=c&63;u||(x=64,o||(g=64)),r.push(n[f],n[m],n[g],n[x])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(YE(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Pb(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const i=n[t.charAt(s++)],l=s<t.length?n[t.charAt(s)]:0;++s;const c=s<t.length?n[t.charAt(s)]:64;++s;const m=s<t.length?n[t.charAt(s)]:64;if(++s,i==null||l==null||c==null||m==null)throw new Db;const g=i<<2|l>>4;if(r.push(g),c!==64){const x=l<<4&240|c>>2;if(r.push(x),m!==64){const A=c<<6&192|m;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Db extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Ob=function(t){const e=YE(t);return XE.encodeByteArray(e,!0)},Qu=function(t){return Ob(t).replace(/\./g,"")},JE=function(t){try{return XE.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Mb(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const jb=()=>Mb().__FIREBASE_DEFAULTS__,Lb=()=>{if(typeof process>"u"||typeof wv>"u")return;const t=wv.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Vb=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&JE(t[1]);return e&&JSON.parse(e)},Lc=()=>{try{return Rb()||jb()||Lb()||Vb()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},ZE=t=>{var e,n;return(n=(e=Lc())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},Jp=t=>{const e=ZE(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},eT=()=>{var t;return(t=Lc())===null||t===void 0?void 0:t.config},tT=t=>{var e;return(e=Lc())===null||e===void 0?void 0:e[`_${t}`]};/**
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
 */class Fb{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function or(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Vc(t){return(await fetch(t,{credentials:"include"})).ok}/**
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
 */function nT(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",s=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},t);return[Qu(JSON.stringify(n)),Qu(JSON.stringify(o)),""].join(".")}const ra={};function Ub(){const t={prod:[],emulator:[]};for(const e of Object.keys(ra))ra[e]?t.emulator.push(e):t.prod.push(e);return t}function Bb(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}let Ev=!1;function Fc(t,e){if(typeof window>"u"||typeof document>"u"||!or(window.location.host)||ra[t]===e||ra[t]||Ev)return;ra[t]=e;function n(g){return`__firebase__banner__${g}`}const r="__firebase__banner",i=Ub().prod.length>0;function o(){const g=document.getElementById(r);g&&g.remove()}function l(g){g.style.display="flex",g.style.background="#7faaf0",g.style.position="fixed",g.style.bottom="5px",g.style.left="5px",g.style.padding=".5em",g.style.borderRadius="5px",g.style.alignItems="center"}function u(g,x){g.setAttribute("width","24"),g.setAttribute("id",x),g.setAttribute("height","24"),g.setAttribute("viewBox","0 0 24 24"),g.setAttribute("fill","none"),g.style.marginLeft="-6px"}function c(){const g=document.createElement("span");return g.style.cursor="pointer",g.style.marginLeft="16px",g.style.fontSize="24px",g.innerHTML=" &times;",g.onclick=()=>{Ev=!0,o()},g}function f(g,x){g.setAttribute("id",x),g.innerText="Learn more",g.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",g.setAttribute("target","__blank"),g.style.paddingLeft="5px",g.style.textDecoration="underline"}function m(){const g=Bb(r),x=n("text"),A=document.getElementById(x)||document.createElement("span"),C=n("learnmore"),N=document.getElementById(C)||document.createElement("a"),E=n("preprendIcon"),y=document.getElementById(E)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(g.created){const _=g.element;l(_),f(N,C);const R=c();u(y,E),_.append(y,A,N,R),document.body.appendChild(_)}i?(A.innerText="Preview backend disconnected.",y.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
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
</defs>`,A.innerText="Preview backend running in this workspace."),A.setAttribute("id",x)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}/**
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
 */function gt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function $b(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(gt())}function zb(){var t;const e=(t=Lc())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Wb(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Hb(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function qb(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Gb(){const t=gt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Kb(){return!zb()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function rT(){try{return typeof indexedDB=="object"}catch{return!1}}function sT(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}function Qb(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
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
 */const Yb="FirebaseError";class nn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=Yb,Object.setPrototypeOf(this,nn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ks.prototype.create)}}class Ks{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?Xb(i,r):"Error",l=`${this.serviceName}: ${o} (${s}).`;return new nn(s,l,r)}}function Xb(t,e){return t.replace(Jb,(n,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Jb=/\{\$([^}]+)}/g;function Zb(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Ms(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const i=t[s],o=e[s];if(Tv(i)&&Tv(o)){if(!Ms(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function Tv(t){return t!==null&&typeof t=="object"}/**
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
 */function Qa(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Bo(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function $o(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function eC(t,e){const n=new tC(t,e);return n.subscribe.bind(n)}class tC{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let s;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");nC(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:r},s.next===void 0&&(s.next=uh),s.error===void 0&&(s.error=uh),s.complete===void 0&&(s.complete=uh);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function nC(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function uh(){}/**
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
 */function ce(t){return t&&t._delegate?t._delegate:t}class zt{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const ms="[DEFAULT]";/**
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
 */class rC{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Fb;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(iC(e))try{this.getOrInitializeService({instanceIdentifier:ms})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=ms){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ms){return this.instances.has(e)}getOptions(e=ms){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[i,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(i);r===l&&o.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const o=this.instances.get(s);return o&&e(o,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:sC(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=ms){return this.component?this.component.multipleInstances?e:ms:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function sC(t){return t===ms?void 0:t}function iC(t){return t.instantiationMode==="EAGER"}/**
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
 */class oC{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new rC(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var se;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(se||(se={}));const aC={debug:se.DEBUG,verbose:se.VERBOSE,info:se.INFO,warn:se.WARN,error:se.ERROR,silent:se.SILENT},lC=se.INFO,uC={[se.DEBUG]:"log",[se.VERBOSE]:"log",[se.INFO]:"info",[se.WARN]:"warn",[se.ERROR]:"error"},cC=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=uC[e];if(s)console[s](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Zp{constructor(e){this.name=e,this._logLevel=lC,this._logHandler=cC,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in se))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?aC[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,se.DEBUG,...e),this._logHandler(this,se.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,se.VERBOSE,...e),this._logHandler(this,se.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,se.INFO,...e),this._logHandler(this,se.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,se.WARN,...e),this._logHandler(this,se.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,se.ERROR,...e),this._logHandler(this,se.ERROR,...e)}}const dC=(t,e)=>e.some(n=>t instanceof n);let xv,Iv;function hC(){return xv||(xv=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function fC(){return Iv||(Iv=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const iT=new WeakMap,bf=new WeakMap,oT=new WeakMap,ch=new WeakMap,em=new WeakMap;function pC(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",i),t.removeEventListener("error",o)},i=()=>{n(Qn(t.result)),s()},o=()=>{r(t.error),s()};t.addEventListener("success",i),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&iT.set(n,t)}).catch(()=>{}),em.set(e,t),e}function mC(t){if(bf.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",o),t.removeEventListener("abort",o)},i=()=>{n(),s()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",i),t.addEventListener("error",o),t.addEventListener("abort",o)});bf.set(t,e)}let Cf={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return bf.get(t);if(e==="objectStoreNames")return t.objectStoreNames||oT.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Qn(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function gC(t){Cf=t(Cf)}function yC(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(dh(this),e,...n);return oT.set(r,e.sort?e.sort():[e]),Qn(r)}:fC().includes(t)?function(...e){return t.apply(dh(this),e),Qn(iT.get(this))}:function(...e){return Qn(t.apply(dh(this),e))}}function vC(t){return typeof t=="function"?yC(t):(t instanceof IDBTransaction&&mC(t),dC(t,hC())?new Proxy(t,Cf):t)}function Qn(t){if(t instanceof IDBRequest)return pC(t);if(ch.has(t))return ch.get(t);const e=vC(t);return e!==t&&(ch.set(t,e),em.set(e,t)),e}const dh=t=>em.get(t);function Uc(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(t,e),l=Qn(o);return r&&o.addEventListener("upgradeneeded",u=>{r(Qn(o.result),u.oldVersion,u.newVersion,Qn(o.transaction),u)}),n&&o.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),l.then(u=>{i&&u.addEventListener("close",()=>i()),s&&u.addEventListener("versionchange",c=>s(c.oldVersion,c.newVersion,c))}).catch(()=>{}),l}function hh(t,{blocked:e}={}){const n=indexedDB.deleteDatabase(t);return e&&n.addEventListener("blocked",r=>e(r.oldVersion,r)),Qn(n).then(()=>{})}const _C=["get","getKey","getAll","getAllKeys","count"],wC=["put","add","delete","clear"],fh=new Map;function Sv(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(fh.get(e))return fh.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=wC.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||_C.includes(n)))return;const i=async function(o,...l){const u=this.transaction(o,s?"readwrite":"readonly");let c=u.store;return r&&(c=c.index(l.shift())),(await Promise.all([c[n](...l),s&&u.done]))[0]};return fh.set(e,i),i}gC(t=>({...t,get:(e,n,r)=>Sv(e,n)||t.get(e,n,r),has:(e,n)=>!!Sv(e,n)||t.has(e,n)}));/**
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
 */class EC{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(TC(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function TC(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Nf="@firebase/app",Av="0.13.2";/**
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
 */const tr=new Zp("@firebase/app"),xC="@firebase/app-compat",IC="@firebase/analytics-compat",SC="@firebase/analytics",AC="@firebase/app-check-compat",kC="@firebase/app-check",bC="@firebase/auth",CC="@firebase/auth-compat",NC="@firebase/database",RC="@firebase/data-connect",PC="@firebase/database-compat",DC="@firebase/functions",OC="@firebase/functions-compat",MC="@firebase/installations",jC="@firebase/installations-compat",LC="@firebase/messaging",VC="@firebase/messaging-compat",FC="@firebase/performance",UC="@firebase/performance-compat",BC="@firebase/remote-config",$C="@firebase/remote-config-compat",zC="@firebase/storage",WC="@firebase/storage-compat",HC="@firebase/firestore",qC="@firebase/ai",GC="@firebase/firestore-compat",KC="firebase",QC="11.10.0";/**
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
 */const Rf="[DEFAULT]",YC={[Nf]:"fire-core",[xC]:"fire-core-compat",[SC]:"fire-analytics",[IC]:"fire-analytics-compat",[kC]:"fire-app-check",[AC]:"fire-app-check-compat",[bC]:"fire-auth",[CC]:"fire-auth-compat",[NC]:"fire-rtdb",[RC]:"fire-data-connect",[PC]:"fire-rtdb-compat",[DC]:"fire-fn",[OC]:"fire-fn-compat",[MC]:"fire-iid",[jC]:"fire-iid-compat",[LC]:"fire-fcm",[VC]:"fire-fcm-compat",[FC]:"fire-perf",[UC]:"fire-perf-compat",[BC]:"fire-rc",[$C]:"fire-rc-compat",[zC]:"fire-gcs",[WC]:"fire-gcs-compat",[HC]:"fire-fst",[GC]:"fire-fst-compat",[qC]:"fire-vertex","fire-js":"fire-js",[KC]:"fire-js-all"};/**
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
 */const Ca=new Map,XC=new Map,Pf=new Map;function kv(t,e){try{t.container.addComponent(e)}catch(n){tr.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function en(t){const e=t.name;if(Pf.has(e))return tr.debug(`There were multiple attempts to register component ${e}.`),!1;Pf.set(e,t);for(const n of Ca.values())kv(n,t);for(const n of XC.values())kv(n,t);return!0}function ts(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function ht(t){return t==null?!1:t.settings!==void 0}/**
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
 */const JC={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Vr=new Ks("app","Firebase",JC);/**
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
 */class ZC{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new zt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Vr.create("app-deleted",{appName:this._name})}}/**
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
 */const Qs=QC;function aT(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Rf,automaticDataCollectionEnabled:!0},e),s=r.name;if(typeof s!="string"||!s)throw Vr.create("bad-app-name",{appName:String(s)});if(n||(n=eT()),!n)throw Vr.create("no-options");const i=Ca.get(s);if(i){if(Ms(n,i.options)&&Ms(r,i.config))return i;throw Vr.create("duplicate-app",{appName:s})}const o=new oC(s);for(const u of Pf.values())o.addComponent(u);const l=new ZC(n,r,o);return Ca.set(s,l),l}function Ya(t=Rf){const e=Ca.get(t);if(!e&&t===Rf&&eT())return aT();if(!e)throw Vr.create("no-app",{appName:t});return e}function eN(){return Array.from(Ca.values())}function ft(t,e,n){var r;let s=(r=YC[t])!==null&&r!==void 0?r:t;n&&(s+=`-${n}`);const i=s.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const l=[`Unable to register library "${s}" with version "${e}":`];i&&l.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&l.push("and"),o&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),tr.warn(l.join(" "));return}en(new zt(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const tN="firebase-heartbeat-database",nN=1,Na="firebase-heartbeat-store";let ph=null;function lT(){return ph||(ph=Uc(tN,nN,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Na)}catch(n){console.warn(n)}}}}).catch(t=>{throw Vr.create("idb-open",{originalErrorMessage:t.message})})),ph}async function rN(t){try{const n=(await lT()).transaction(Na),r=await n.objectStore(Na).get(uT(t));return await n.done,r}catch(e){if(e instanceof nn)tr.warn(e.message);else{const n=Vr.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});tr.warn(n.message)}}}async function bv(t,e){try{const r=(await lT()).transaction(Na,"readwrite");await r.objectStore(Na).put(e,uT(t)),await r.done}catch(n){if(n instanceof nn)tr.warn(n.message);else{const r=Vr.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});tr.warn(r.message)}}}function uT(t){return`${t.name}!${t.options.appId}`}/**
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
 */const sN=1024,iN=30;class oN{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new lN(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Cv();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>iN){const o=uN(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){tr.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Cv(),{heartbeatsToSend:r,unsentEntries:s}=aN(this._heartbeatsCache.heartbeats),i=Qu(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return tr.warn(n),""}}}function Cv(){return new Date().toISOString().substring(0,10)}function aN(t,e=sN){const n=[];let r=t.slice();for(const s of t){const i=n.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),Nv(n)>e){i.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),Nv(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class lN{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return rT()?sT().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await rN(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return bv(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return bv(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Nv(t){return Qu(JSON.stringify({version:2,heartbeats:t})).length}function uN(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
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
 */function cN(t){en(new zt("platform-logger",e=>new EC(e),"PRIVATE")),en(new zt("heartbeat",e=>new oN(e),"PRIVATE")),ft(Nf,Av,t),ft(Nf,Av,"esm2017"),ft("fire-js","")}cN("");var dN="firebase",hN="11.10.0";/**
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
 */ft(dN,hN,"app");var Rv=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Fr,cT;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,w){function S(){}S.prototype=w.prototype,I.D=w.prototype,I.prototype=new S,I.prototype.constructor=I,I.C=function(T,b,P){for(var k=Array(arguments.length-2),J=2;J<arguments.length;J++)k[J-2]=arguments[J];return w.prototype[b].apply(T,k)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,w,S){S||(S=0);var T=Array(16);if(typeof w=="string")for(var b=0;16>b;++b)T[b]=w.charCodeAt(S++)|w.charCodeAt(S++)<<8|w.charCodeAt(S++)<<16|w.charCodeAt(S++)<<24;else for(b=0;16>b;++b)T[b]=w[S++]|w[S++]<<8|w[S++]<<16|w[S++]<<24;w=I.g[0],S=I.g[1],b=I.g[2];var P=I.g[3],k=w+(P^S&(b^P))+T[0]+3614090360&4294967295;w=S+(k<<7&4294967295|k>>>25),k=P+(b^w&(S^b))+T[1]+3905402710&4294967295,P=w+(k<<12&4294967295|k>>>20),k=b+(S^P&(w^S))+T[2]+606105819&4294967295,b=P+(k<<17&4294967295|k>>>15),k=S+(w^b&(P^w))+T[3]+3250441966&4294967295,S=b+(k<<22&4294967295|k>>>10),k=w+(P^S&(b^P))+T[4]+4118548399&4294967295,w=S+(k<<7&4294967295|k>>>25),k=P+(b^w&(S^b))+T[5]+1200080426&4294967295,P=w+(k<<12&4294967295|k>>>20),k=b+(S^P&(w^S))+T[6]+2821735955&4294967295,b=P+(k<<17&4294967295|k>>>15),k=S+(w^b&(P^w))+T[7]+4249261313&4294967295,S=b+(k<<22&4294967295|k>>>10),k=w+(P^S&(b^P))+T[8]+1770035416&4294967295,w=S+(k<<7&4294967295|k>>>25),k=P+(b^w&(S^b))+T[9]+2336552879&4294967295,P=w+(k<<12&4294967295|k>>>20),k=b+(S^P&(w^S))+T[10]+4294925233&4294967295,b=P+(k<<17&4294967295|k>>>15),k=S+(w^b&(P^w))+T[11]+2304563134&4294967295,S=b+(k<<22&4294967295|k>>>10),k=w+(P^S&(b^P))+T[12]+1804603682&4294967295,w=S+(k<<7&4294967295|k>>>25),k=P+(b^w&(S^b))+T[13]+4254626195&4294967295,P=w+(k<<12&4294967295|k>>>20),k=b+(S^P&(w^S))+T[14]+2792965006&4294967295,b=P+(k<<17&4294967295|k>>>15),k=S+(w^b&(P^w))+T[15]+1236535329&4294967295,S=b+(k<<22&4294967295|k>>>10),k=w+(b^P&(S^b))+T[1]+4129170786&4294967295,w=S+(k<<5&4294967295|k>>>27),k=P+(S^b&(w^S))+T[6]+3225465664&4294967295,P=w+(k<<9&4294967295|k>>>23),k=b+(w^S&(P^w))+T[11]+643717713&4294967295,b=P+(k<<14&4294967295|k>>>18),k=S+(P^w&(b^P))+T[0]+3921069994&4294967295,S=b+(k<<20&4294967295|k>>>12),k=w+(b^P&(S^b))+T[5]+3593408605&4294967295,w=S+(k<<5&4294967295|k>>>27),k=P+(S^b&(w^S))+T[10]+38016083&4294967295,P=w+(k<<9&4294967295|k>>>23),k=b+(w^S&(P^w))+T[15]+3634488961&4294967295,b=P+(k<<14&4294967295|k>>>18),k=S+(P^w&(b^P))+T[4]+3889429448&4294967295,S=b+(k<<20&4294967295|k>>>12),k=w+(b^P&(S^b))+T[9]+568446438&4294967295,w=S+(k<<5&4294967295|k>>>27),k=P+(S^b&(w^S))+T[14]+3275163606&4294967295,P=w+(k<<9&4294967295|k>>>23),k=b+(w^S&(P^w))+T[3]+4107603335&4294967295,b=P+(k<<14&4294967295|k>>>18),k=S+(P^w&(b^P))+T[8]+1163531501&4294967295,S=b+(k<<20&4294967295|k>>>12),k=w+(b^P&(S^b))+T[13]+2850285829&4294967295,w=S+(k<<5&4294967295|k>>>27),k=P+(S^b&(w^S))+T[2]+4243563512&4294967295,P=w+(k<<9&4294967295|k>>>23),k=b+(w^S&(P^w))+T[7]+1735328473&4294967295,b=P+(k<<14&4294967295|k>>>18),k=S+(P^w&(b^P))+T[12]+2368359562&4294967295,S=b+(k<<20&4294967295|k>>>12),k=w+(S^b^P)+T[5]+4294588738&4294967295,w=S+(k<<4&4294967295|k>>>28),k=P+(w^S^b)+T[8]+2272392833&4294967295,P=w+(k<<11&4294967295|k>>>21),k=b+(P^w^S)+T[11]+1839030562&4294967295,b=P+(k<<16&4294967295|k>>>16),k=S+(b^P^w)+T[14]+4259657740&4294967295,S=b+(k<<23&4294967295|k>>>9),k=w+(S^b^P)+T[1]+2763975236&4294967295,w=S+(k<<4&4294967295|k>>>28),k=P+(w^S^b)+T[4]+1272893353&4294967295,P=w+(k<<11&4294967295|k>>>21),k=b+(P^w^S)+T[7]+4139469664&4294967295,b=P+(k<<16&4294967295|k>>>16),k=S+(b^P^w)+T[10]+3200236656&4294967295,S=b+(k<<23&4294967295|k>>>9),k=w+(S^b^P)+T[13]+681279174&4294967295,w=S+(k<<4&4294967295|k>>>28),k=P+(w^S^b)+T[0]+3936430074&4294967295,P=w+(k<<11&4294967295|k>>>21),k=b+(P^w^S)+T[3]+3572445317&4294967295,b=P+(k<<16&4294967295|k>>>16),k=S+(b^P^w)+T[6]+76029189&4294967295,S=b+(k<<23&4294967295|k>>>9),k=w+(S^b^P)+T[9]+3654602809&4294967295,w=S+(k<<4&4294967295|k>>>28),k=P+(w^S^b)+T[12]+3873151461&4294967295,P=w+(k<<11&4294967295|k>>>21),k=b+(P^w^S)+T[15]+530742520&4294967295,b=P+(k<<16&4294967295|k>>>16),k=S+(b^P^w)+T[2]+3299628645&4294967295,S=b+(k<<23&4294967295|k>>>9),k=w+(b^(S|~P))+T[0]+4096336452&4294967295,w=S+(k<<6&4294967295|k>>>26),k=P+(S^(w|~b))+T[7]+1126891415&4294967295,P=w+(k<<10&4294967295|k>>>22),k=b+(w^(P|~S))+T[14]+2878612391&4294967295,b=P+(k<<15&4294967295|k>>>17),k=S+(P^(b|~w))+T[5]+4237533241&4294967295,S=b+(k<<21&4294967295|k>>>11),k=w+(b^(S|~P))+T[12]+1700485571&4294967295,w=S+(k<<6&4294967295|k>>>26),k=P+(S^(w|~b))+T[3]+2399980690&4294967295,P=w+(k<<10&4294967295|k>>>22),k=b+(w^(P|~S))+T[10]+4293915773&4294967295,b=P+(k<<15&4294967295|k>>>17),k=S+(P^(b|~w))+T[1]+2240044497&4294967295,S=b+(k<<21&4294967295|k>>>11),k=w+(b^(S|~P))+T[8]+1873313359&4294967295,w=S+(k<<6&4294967295|k>>>26),k=P+(S^(w|~b))+T[15]+4264355552&4294967295,P=w+(k<<10&4294967295|k>>>22),k=b+(w^(P|~S))+T[6]+2734768916&4294967295,b=P+(k<<15&4294967295|k>>>17),k=S+(P^(b|~w))+T[13]+1309151649&4294967295,S=b+(k<<21&4294967295|k>>>11),k=w+(b^(S|~P))+T[4]+4149444226&4294967295,w=S+(k<<6&4294967295|k>>>26),k=P+(S^(w|~b))+T[11]+3174756917&4294967295,P=w+(k<<10&4294967295|k>>>22),k=b+(w^(P|~S))+T[2]+718787259&4294967295,b=P+(k<<15&4294967295|k>>>17),k=S+(P^(b|~w))+T[9]+3951481745&4294967295,I.g[0]=I.g[0]+w&4294967295,I.g[1]=I.g[1]+(b+(k<<21&4294967295|k>>>11))&4294967295,I.g[2]=I.g[2]+b&4294967295,I.g[3]=I.g[3]+P&4294967295}r.prototype.u=function(I,w){w===void 0&&(w=I.length);for(var S=w-this.blockSize,T=this.B,b=this.h,P=0;P<w;){if(b==0)for(;P<=S;)s(this,I,P),P+=this.blockSize;if(typeof I=="string"){for(;P<w;)if(T[b++]=I.charCodeAt(P++),b==this.blockSize){s(this,T),b=0;break}}else for(;P<w;)if(T[b++]=I[P++],b==this.blockSize){s(this,T),b=0;break}}this.h=b,this.o+=w},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var w=1;w<I.length-8;++w)I[w]=0;var S=8*this.o;for(w=I.length-8;w<I.length;++w)I[w]=S&255,S/=256;for(this.u(I),I=Array(16),w=S=0;4>w;++w)for(var T=0;32>T;T+=8)I[S++]=this.g[w]>>>T&255;return I};function i(I,w){var S=l;return Object.prototype.hasOwnProperty.call(S,I)?S[I]:S[I]=w(I)}function o(I,w){this.h=w;for(var S=[],T=!0,b=I.length-1;0<=b;b--){var P=I[b]|0;T&&P==w||(S[b]=P,T=!1)}this.g=S}var l={};function u(I){return-128<=I&&128>I?i(I,function(w){return new o([w|0],0>w?-1:0)}):new o([I|0],0>I?-1:0)}function c(I){if(isNaN(I)||!isFinite(I))return m;if(0>I)return N(c(-I));for(var w=[],S=1,T=0;I>=S;T++)w[T]=I/S|0,S*=4294967296;return new o(w,0)}function f(I,w){if(I.length==0)throw Error("number format error: empty string");if(w=w||10,2>w||36<w)throw Error("radix out of range: "+w);if(I.charAt(0)=="-")return N(f(I.substring(1),w));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var S=c(Math.pow(w,8)),T=m,b=0;b<I.length;b+=8){var P=Math.min(8,I.length-b),k=parseInt(I.substring(b,b+P),w);8>P?(P=c(Math.pow(w,P)),T=T.j(P).add(c(k))):(T=T.j(S),T=T.add(c(k)))}return T}var m=u(0),g=u(1),x=u(16777216);t=o.prototype,t.m=function(){if(C(this))return-N(this).m();for(var I=0,w=1,S=0;S<this.g.length;S++){var T=this.i(S);I+=(0<=T?T:4294967296+T)*w,w*=4294967296}return I},t.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(A(this))return"0";if(C(this))return"-"+N(this).toString(I);for(var w=c(Math.pow(I,6)),S=this,T="";;){var b=R(S,w).g;S=E(S,b.j(w));var P=((0<S.g.length?S.g[0]:S.h)>>>0).toString(I);if(S=b,A(S))return P+T;for(;6>P.length;)P="0"+P;T=P+T}},t.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function A(I){if(I.h!=0)return!1;for(var w=0;w<I.g.length;w++)if(I.g[w]!=0)return!1;return!0}function C(I){return I.h==-1}t.l=function(I){return I=E(this,I),C(I)?-1:A(I)?0:1};function N(I){for(var w=I.g.length,S=[],T=0;T<w;T++)S[T]=~I.g[T];return new o(S,~I.h).add(g)}t.abs=function(){return C(this)?N(this):this},t.add=function(I){for(var w=Math.max(this.g.length,I.g.length),S=[],T=0,b=0;b<=w;b++){var P=T+(this.i(b)&65535)+(I.i(b)&65535),k=(P>>>16)+(this.i(b)>>>16)+(I.i(b)>>>16);T=k>>>16,P&=65535,k&=65535,S[b]=k<<16|P}return new o(S,S[S.length-1]&-2147483648?-1:0)};function E(I,w){return I.add(N(w))}t.j=function(I){if(A(this)||A(I))return m;if(C(this))return C(I)?N(this).j(N(I)):N(N(this).j(I));if(C(I))return N(this.j(N(I)));if(0>this.l(x)&&0>I.l(x))return c(this.m()*I.m());for(var w=this.g.length+I.g.length,S=[],T=0;T<2*w;T++)S[T]=0;for(T=0;T<this.g.length;T++)for(var b=0;b<I.g.length;b++){var P=this.i(T)>>>16,k=this.i(T)&65535,J=I.i(b)>>>16,yt=I.i(b)&65535;S[2*T+2*b]+=k*yt,y(S,2*T+2*b),S[2*T+2*b+1]+=P*yt,y(S,2*T+2*b+1),S[2*T+2*b+1]+=k*J,y(S,2*T+2*b+1),S[2*T+2*b+2]+=P*J,y(S,2*T+2*b+2)}for(T=0;T<w;T++)S[T]=S[2*T+1]<<16|S[2*T];for(T=w;T<2*w;T++)S[T]=0;return new o(S,0)};function y(I,w){for(;(I[w]&65535)!=I[w];)I[w+1]+=I[w]>>>16,I[w]&=65535,w++}function _(I,w){this.g=I,this.h=w}function R(I,w){if(A(w))throw Error("division by zero");if(A(I))return new _(m,m);if(C(I))return w=R(N(I),w),new _(N(w.g),N(w.h));if(C(w))return w=R(I,N(w)),new _(N(w.g),w.h);if(30<I.g.length){if(C(I)||C(w))throw Error("slowDivide_ only works with positive integers.");for(var S=g,T=w;0>=T.l(I);)S=V(S),T=V(T);var b=j(S,1),P=j(T,1);for(T=j(T,2),S=j(S,2);!A(T);){var k=P.add(T);0>=k.l(I)&&(b=b.add(S),P=k),T=j(T,1),S=j(S,1)}return w=E(I,b.j(w)),new _(b,w)}for(b=m;0<=I.l(w);){for(S=Math.max(1,Math.floor(I.m()/w.m())),T=Math.ceil(Math.log(S)/Math.LN2),T=48>=T?1:Math.pow(2,T-48),P=c(S),k=P.j(w);C(k)||0<k.l(I);)S-=T,P=c(S),k=P.j(w);A(P)&&(P=g),b=b.add(P),I=E(I,k)}return new _(b,I)}t.A=function(I){return R(this,I).h},t.and=function(I){for(var w=Math.max(this.g.length,I.g.length),S=[],T=0;T<w;T++)S[T]=this.i(T)&I.i(T);return new o(S,this.h&I.h)},t.or=function(I){for(var w=Math.max(this.g.length,I.g.length),S=[],T=0;T<w;T++)S[T]=this.i(T)|I.i(T);return new o(S,this.h|I.h)},t.xor=function(I){for(var w=Math.max(this.g.length,I.g.length),S=[],T=0;T<w;T++)S[T]=this.i(T)^I.i(T);return new o(S,this.h^I.h)};function V(I){for(var w=I.g.length+1,S=[],T=0;T<w;T++)S[T]=I.i(T)<<1|I.i(T-1)>>>31;return new o(S,I.h)}function j(I,w){var S=w>>5;w%=32;for(var T=I.g.length-S,b=[],P=0;P<T;P++)b[P]=0<w?I.i(P+S)>>>w|I.i(P+S+1)<<32-w:I.i(P+S);return new o(b,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,cT=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=c,o.fromString=f,Fr=o}).apply(typeof Rv<"u"?Rv:typeof self<"u"?self:typeof window<"u"?window:{});var zl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var dT,zo,hT,du,Df,fT,pT,mT;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,h,p){return a==Array.prototype||a==Object.prototype||(a[h]=p.value),a};function n(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof zl=="object"&&zl];for(var h=0;h<a.length;++h){var p=a[h];if(p&&p.Math==Math)return p}throw Error("Cannot find global object")}var r=n(this);function s(a,h){if(h)e:{var p=r;a=a.split(".");for(var v=0;v<a.length-1;v++){var O=a[v];if(!(O in p))break e;p=p[O]}a=a[a.length-1],v=p[a],h=h(v),h!=v&&h!=null&&e(p,a,{configurable:!0,writable:!0,value:h})}}function i(a,h){a instanceof String&&(a+="");var p=0,v=!1,O={next:function(){if(!v&&p<a.length){var M=p++;return{value:h(M,a[M]),done:!1}}return v=!0,{done:!0,value:void 0}}};return O[Symbol.iterator]=function(){return O},O}s("Array.prototype.values",function(a){return a||function(){return i(this,function(h,p){return p})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},l=this||self;function u(a){var h=typeof a;return h=h!="object"?h:a?Array.isArray(a)?"array":h:"null",h=="array"||h=="object"&&typeof a.length=="number"}function c(a){var h=typeof a;return h=="object"&&a!=null||h=="function"}function f(a,h,p){return a.call.apply(a.bind,arguments)}function m(a,h,p){if(!a)throw Error();if(2<arguments.length){var v=Array.prototype.slice.call(arguments,2);return function(){var O=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(O,v),a.apply(h,O)}}return function(){return a.apply(h,arguments)}}function g(a,h,p){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,g.apply(null,arguments)}function x(a,h){var p=Array.prototype.slice.call(arguments,1);return function(){var v=p.slice();return v.push.apply(v,arguments),a.apply(this,v)}}function A(a,h){function p(){}p.prototype=h.prototype,a.aa=h.prototype,a.prototype=new p,a.prototype.constructor=a,a.Qb=function(v,O,M){for(var $=Array(arguments.length-2),me=2;me<arguments.length;me++)$[me-2]=arguments[me];return h.prototype[O].apply(v,$)}}function C(a){const h=a.length;if(0<h){const p=Array(h);for(let v=0;v<h;v++)p[v]=a[v];return p}return[]}function N(a,h){for(let p=1;p<arguments.length;p++){const v=arguments[p];if(u(v)){const O=a.length||0,M=v.length||0;a.length=O+M;for(let $=0;$<M;$++)a[O+$]=v[$]}else a.push(v)}}class E{constructor(h,p){this.i=h,this.j=p,this.h=0,this.g=null}get(){let h;return 0<this.h?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function y(a){return/^[\s\xa0]*$/.test(a)}function _(){var a=l.navigator;return a&&(a=a.userAgent)?a:""}function R(a){return R[" "](a),a}R[" "]=function(){};var V=_().indexOf("Gecko")!=-1&&!(_().toLowerCase().indexOf("webkit")!=-1&&_().indexOf("Edge")==-1)&&!(_().indexOf("Trident")!=-1||_().indexOf("MSIE")!=-1)&&_().indexOf("Edge")==-1;function j(a,h,p){for(const v in a)h.call(p,a[v],v,a)}function I(a,h){for(const p in a)h.call(void 0,a[p],p,a)}function w(a){const h={};for(const p in a)h[p]=a[p];return h}const S="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function T(a,h){let p,v;for(let O=1;O<arguments.length;O++){v=arguments[O];for(p in v)a[p]=v[p];for(let M=0;M<S.length;M++)p=S[M],Object.prototype.hasOwnProperty.call(v,p)&&(a[p]=v[p])}}function b(a){var h=1;a=a.split(":");const p=[];for(;0<h&&a.length;)p.push(a.shift()),h--;return a.length&&p.push(a.join(":")),p}function P(a){l.setTimeout(()=>{throw a},0)}function k(){var a=Q;let h=null;return a.g&&(h=a.g,a.g=a.g.next,a.g||(a.h=null),h.next=null),h}class J{constructor(){this.h=this.g=null}add(h,p){const v=yt.get();v.set(h,p),this.h?this.h.next=v:this.g=v,this.h=v}}var yt=new E(()=>new rn,a=>a.reset());class rn{constructor(){this.next=this.g=this.h=null}set(h,p){this.h=h,this.g=p,this.next=null}reset(){this.next=this.g=this.h=null}}let At,z=!1,Q=new J,Z=()=>{const a=l.Promise.resolve(void 0);At=()=>{a.then(pe)}};var pe=()=>{for(var a;a=k();){try{a.h.call(a.g)}catch(p){P(p)}var h=yt;h.j(a),100>h.h&&(h.h++,a.next=h.g,h.g=a)}z=!1};function oe(){this.s=this.s,this.C=this.C}oe.prototype.s=!1,oe.prototype.ma=function(){this.s||(this.s=!0,this.N())},oe.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function xe(a,h){this.type=a,this.g=this.target=h,this.defaultPrevented=!1}xe.prototype.h=function(){this.defaultPrevented=!0};var He=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var a=!1,h=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const p=()=>{};l.addEventListener("test",p,h),l.removeEventListener("test",p,h)}catch{}return a}();function sn(a,h){if(xe.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var p=this.type=a.type,v=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=h,h=a.relatedTarget){if(V){e:{try{R(h.nodeName);var O=!0;break e}catch{}O=!1}O||(h=null)}}else p=="mouseover"?h=a.fromElement:p=="mouseout"&&(h=a.toElement);this.relatedTarget=h,v?(this.clientX=v.clientX!==void 0?v.clientX:v.pageX,this.clientY=v.clientY!==void 0?v.clientY:v.pageY,this.screenX=v.screenX||0,this.screenY=v.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:nt[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&sn.aa.h.call(this)}}A(sn,xe);var nt={2:"touch",3:"pen",4:"mouse"};sn.prototype.h=function(){sn.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var on="closure_listenable_"+(1e6*Math.random()|0),ll=0;function gd(a,h,p,v,O){this.listener=a,this.proxy=null,this.src=h,this.type=p,this.capture=!!v,this.ha=O,this.key=++ll,this.da=this.fa=!1}function Zs(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function as(a){this.src=a,this.g={},this.h=0}as.prototype.add=function(a,h,p,v,O){var M=a.toString();a=this.g[M],a||(a=this.g[M]=[],this.h++);var $=jn(a,h,v,O);return-1<$?(h=a[$],p||(h.fa=!1)):(h=new gd(h,this.src,M,!!v,O),h.fa=p,a.push(h)),h};function ls(a,h){var p=h.type;if(p in a.g){var v=a.g[p],O=Array.prototype.indexOf.call(v,h,void 0),M;(M=0<=O)&&Array.prototype.splice.call(v,O,1),M&&(Zs(h),a.g[p].length==0&&(delete a.g[p],a.h--))}}function jn(a,h,p,v){for(var O=0;O<a.length;++O){var M=a[O];if(!M.da&&M.listener==h&&M.capture==!!p&&M.ha==v)return O}return-1}var B="closure_lm_"+(1e6*Math.random()|0),te={};function Be(a,h,p,v,O){if(Array.isArray(h)){for(var M=0;M<h.length;M++)Be(a,h[M],p,v,O);return null}return p=lg(p),a&&a[on]?a.K(h,p,c(v)?!!v.capture:!1,O):lo(a,h,p,!1,v,O)}function lo(a,h,p,v,O,M){if(!h)throw Error("Invalid event type");var $=c(O)?!!O.capture:!!O,me=vd(a);if(me||(a[B]=me=new as(a)),p=me.add(h,p,v,$,M),p.proxy)return p;if(v=uo(),p.proxy=v,v.src=a,v.listener=p,a.addEventListener)He||(O=$),O===void 0&&(O=!1),a.addEventListener(h.toString(),v,O);else if(a.attachEvent)a.attachEvent(ag(h.toString()),v);else if(a.addListener&&a.removeListener)a.addListener(v);else throw Error("addEventListener and attachEvent are unavailable.");return p}function uo(){function a(p){return h.call(a.src,a.listener,p)}const h=k1;return a}function ul(a,h,p,v,O){if(Array.isArray(h))for(var M=0;M<h.length;M++)ul(a,h[M],p,v,O);else v=c(v)?!!v.capture:!!v,p=lg(p),a&&a[on]?(a=a.i,h=String(h).toString(),h in a.g&&(M=a.g[h],p=jn(M,p,v,O),-1<p&&(Zs(M[p]),Array.prototype.splice.call(M,p,1),M.length==0&&(delete a.g[h],a.h--)))):a&&(a=vd(a))&&(h=a.g[h.toString()],a=-1,h&&(a=jn(h,p,v,O)),(p=-1<a?h[a]:null)&&yd(p))}function yd(a){if(typeof a!="number"&&a&&!a.da){var h=a.src;if(h&&h[on])ls(h.i,a);else{var p=a.type,v=a.proxy;h.removeEventListener?h.removeEventListener(p,v,a.capture):h.detachEvent?h.detachEvent(ag(p),v):h.addListener&&h.removeListener&&h.removeListener(v),(p=vd(h))?(ls(p,a),p.h==0&&(p.src=null,h[B]=null)):Zs(a)}}}function ag(a){return a in te?te[a]:te[a]="on"+a}function k1(a,h){if(a.da)a=!0;else{h=new sn(h,this);var p=a.listener,v=a.ha||a.src;a.fa&&yd(a),a=p.call(v,h)}return a}function vd(a){return a=a[B],a instanceof as?a:null}var _d="__closure_events_fn_"+(1e9*Math.random()>>>0);function lg(a){return typeof a=="function"?a:(a[_d]||(a[_d]=function(h){return a.handleEvent(h)}),a[_d])}function rt(){oe.call(this),this.i=new as(this),this.M=this,this.F=null}A(rt,oe),rt.prototype[on]=!0,rt.prototype.removeEventListener=function(a,h,p,v){ul(this,a,h,p,v)};function vt(a,h){var p,v=a.F;if(v)for(p=[];v;v=v.F)p.push(v);if(a=a.M,v=h.type||h,typeof h=="string")h=new xe(h,a);else if(h instanceof xe)h.target=h.target||a;else{var O=h;h=new xe(v,a),T(h,O)}if(O=!0,p)for(var M=p.length-1;0<=M;M--){var $=h.g=p[M];O=cl($,v,!0,h)&&O}if($=h.g=a,O=cl($,v,!0,h)&&O,O=cl($,v,!1,h)&&O,p)for(M=0;M<p.length;M++)$=h.g=p[M],O=cl($,v,!1,h)&&O}rt.prototype.N=function(){if(rt.aa.N.call(this),this.i){var a=this.i,h;for(h in a.g){for(var p=a.g[h],v=0;v<p.length;v++)Zs(p[v]);delete a.g[h],a.h--}}this.F=null},rt.prototype.K=function(a,h,p,v){return this.i.add(String(a),h,!1,p,v)},rt.prototype.L=function(a,h,p,v){return this.i.add(String(a),h,!0,p,v)};function cl(a,h,p,v){if(h=a.i.g[String(h)],!h)return!0;h=h.concat();for(var O=!0,M=0;M<h.length;++M){var $=h[M];if($&&!$.da&&$.capture==p){var me=$.listener,Qe=$.ha||$.src;$.fa&&ls(a.i,$),O=me.call(Qe,v)!==!1&&O}}return O&&!v.defaultPrevented}function ug(a,h,p){if(typeof a=="function")p&&(a=g(a,p));else if(a&&typeof a.handleEvent=="function")a=g(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(h)?-1:l.setTimeout(a,h||0)}function cg(a){a.g=ug(()=>{a.g=null,a.i&&(a.i=!1,cg(a))},a.l);const h=a.h;a.h=null,a.m.apply(null,h)}class b1 extends oe{constructor(h,p){super(),this.m=h,this.l=p,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:cg(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function co(a){oe.call(this),this.h=a,this.g={}}A(co,oe);var dg=[];function hg(a){j(a.g,function(h,p){this.g.hasOwnProperty(p)&&yd(h)},a),a.g={}}co.prototype.N=function(){co.aa.N.call(this),hg(this)},co.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var wd=l.JSON.stringify,C1=l.JSON.parse,N1=class{stringify(a){return l.JSON.stringify(a,void 0)}parse(a){return l.JSON.parse(a,void 0)}};function Ed(){}Ed.prototype.h=null;function fg(a){return a.h||(a.h=a.i())}function pg(){}var ho={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Td(){xe.call(this,"d")}A(Td,xe);function xd(){xe.call(this,"c")}A(xd,xe);var us={},mg=null;function dl(){return mg=mg||new rt}us.La="serverreachability";function gg(a){xe.call(this,us.La,a)}A(gg,xe);function fo(a){const h=dl();vt(h,new gg(h))}us.STAT_EVENT="statevent";function yg(a,h){xe.call(this,us.STAT_EVENT,a),this.stat=h}A(yg,xe);function _t(a){const h=dl();vt(h,new yg(h,a))}us.Ma="timingevent";function vg(a,h){xe.call(this,us.Ma,a),this.size=h}A(vg,xe);function po(a,h){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){a()},h)}function mo(){this.g=!0}mo.prototype.xa=function(){this.g=!1};function R1(a,h,p,v,O,M){a.info(function(){if(a.g)if(M)for(var $="",me=M.split("&"),Qe=0;Qe<me.length;Qe++){var ue=me[Qe].split("=");if(1<ue.length){var st=ue[0];ue=ue[1];var it=st.split("_");$=2<=it.length&&it[1]=="type"?$+(st+"="+ue+"&"):$+(st+"=redacted&")}}else $=null;else $=M;return"XMLHTTP REQ ("+v+") [attempt "+O+"]: "+h+`
`+p+`
`+$})}function P1(a,h,p,v,O,M,$){a.info(function(){return"XMLHTTP RESP ("+v+") [ attempt "+O+"]: "+h+`
`+p+`
`+M+" "+$})}function ei(a,h,p,v){a.info(function(){return"XMLHTTP TEXT ("+h+"): "+O1(a,p)+(v?" "+v:"")})}function D1(a,h){a.info(function(){return"TIMEOUT: "+h})}mo.prototype.info=function(){};function O1(a,h){if(!a.g)return h;if(!h)return null;try{var p=JSON.parse(h);if(p){for(a=0;a<p.length;a++)if(Array.isArray(p[a])){var v=p[a];if(!(2>v.length)){var O=v[1];if(Array.isArray(O)&&!(1>O.length)){var M=O[0];if(M!="noop"&&M!="stop"&&M!="close")for(var $=1;$<O.length;$++)O[$]=""}}}}return wd(p)}catch{return h}}var hl={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},_g={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Id;function fl(){}A(fl,Ed),fl.prototype.g=function(){return new XMLHttpRequest},fl.prototype.i=function(){return{}},Id=new fl;function cr(a,h,p,v){this.j=a,this.i=h,this.l=p,this.R=v||1,this.U=new co(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new wg}function wg(){this.i=null,this.g="",this.h=!1}var Eg={},Sd={};function Ad(a,h,p){a.L=1,a.v=yl(Ln(h)),a.m=p,a.P=!0,Tg(a,null)}function Tg(a,h){a.F=Date.now(),pl(a),a.A=Ln(a.v);var p=a.A,v=a.R;Array.isArray(v)||(v=[String(v)]),jg(p.i,"t",v),a.C=0,p=a.j.J,a.h=new wg,a.g=ey(a.j,p?h:null,!a.m),0<a.O&&(a.M=new b1(g(a.Y,a,a.g),a.O)),h=a.U,p=a.g,v=a.ca;var O="readystatechange";Array.isArray(O)||(O&&(dg[0]=O.toString()),O=dg);for(var M=0;M<O.length;M++){var $=Be(p,O[M],v||h.handleEvent,!1,h.h||h);if(!$)break;h.g[$.key]=$}h=a.H?w(a.H):{},a.m?(a.u||(a.u="POST"),h["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,h)):(a.u="GET",a.g.ea(a.A,a.u,null,h)),fo(),R1(a.i,a.u,a.A,a.l,a.R,a.m)}cr.prototype.ca=function(a){a=a.target;const h=this.M;h&&Vn(a)==3?h.j():this.Y(a)},cr.prototype.Y=function(a){try{if(a==this.g)e:{const it=Vn(this.g);var h=this.g.Ba();const ri=this.g.Z();if(!(3>it)&&(it!=3||this.g&&(this.h.h||this.g.oa()||zg(this.g)))){this.J||it!=4||h==7||(h==8||0>=ri?fo(3):fo(2)),kd(this);var p=this.g.Z();this.X=p;t:if(xg(this)){var v=zg(this.g);a="";var O=v.length,M=Vn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){cs(this),go(this);var $="";break t}this.h.i=new l.TextDecoder}for(h=0;h<O;h++)this.h.h=!0,a+=this.h.i.decode(v[h],{stream:!(M&&h==O-1)});v.length=0,this.h.g+=a,this.C=0,$=this.h.g}else $=this.g.oa();if(this.o=p==200,P1(this.i,this.u,this.A,this.l,this.R,it,p),this.o){if(this.T&&!this.K){t:{if(this.g){var me,Qe=this.g;if((me=Qe.g?Qe.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(me)){var ue=me;break t}}ue=null}if(p=ue)ei(this.i,this.l,p,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,bd(this,p);else{this.o=!1,this.s=3,_t(12),cs(this),go(this);break e}}if(this.P){p=!0;let an;for(;!this.J&&this.C<$.length;)if(an=M1(this,$),an==Sd){it==4&&(this.s=4,_t(14),p=!1),ei(this.i,this.l,null,"[Incomplete Response]");break}else if(an==Eg){this.s=4,_t(15),ei(this.i,this.l,$,"[Invalid Chunk]"),p=!1;break}else ei(this.i,this.l,an,null),bd(this,an);if(xg(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),it!=4||$.length!=0||this.h.h||(this.s=1,_t(16),p=!1),this.o=this.o&&p,!p)ei(this.i,this.l,$,"[Invalid Chunked Response]"),cs(this),go(this);else if(0<$.length&&!this.W){this.W=!0;var st=this.j;st.g==this&&st.ba&&!st.M&&(st.j.info("Great, no buffering proxy detected. Bytes received: "+$.length),Od(st),st.M=!0,_t(11))}}else ei(this.i,this.l,$,null),bd(this,$);it==4&&cs(this),this.o&&!this.J&&(it==4?Yg(this.j,this):(this.o=!1,pl(this)))}else J1(this.g),p==400&&0<$.indexOf("Unknown SID")?(this.s=3,_t(12)):(this.s=0,_t(13)),cs(this),go(this)}}}catch{}finally{}};function xg(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function M1(a,h){var p=a.C,v=h.indexOf(`
`,p);return v==-1?Sd:(p=Number(h.substring(p,v)),isNaN(p)?Eg:(v+=1,v+p>h.length?Sd:(h=h.slice(v,v+p),a.C=v+p,h)))}cr.prototype.cancel=function(){this.J=!0,cs(this)};function pl(a){a.S=Date.now()+a.I,Ig(a,a.I)}function Ig(a,h){if(a.B!=null)throw Error("WatchDog timer not null");a.B=po(g(a.ba,a),h)}function kd(a){a.B&&(l.clearTimeout(a.B),a.B=null)}cr.prototype.ba=function(){this.B=null;const a=Date.now();0<=a-this.S?(D1(this.i,this.A),this.L!=2&&(fo(),_t(17)),cs(this),this.s=2,go(this)):Ig(this,this.S-a)};function go(a){a.j.G==0||a.J||Yg(a.j,a)}function cs(a){kd(a);var h=a.M;h&&typeof h.ma=="function"&&h.ma(),a.M=null,hg(a.U),a.g&&(h=a.g,a.g=null,h.abort(),h.ma())}function bd(a,h){try{var p=a.j;if(p.G!=0&&(p.g==a||Cd(p.h,a))){if(!a.K&&Cd(p.h,a)&&p.G==3){try{var v=p.Da.g.parse(h)}catch{v=null}if(Array.isArray(v)&&v.length==3){var O=v;if(O[0]==0){e:if(!p.u){if(p.g)if(p.g.F+3e3<a.F)xl(p),El(p);else break e;Dd(p),_t(18)}}else p.za=O[1],0<p.za-p.T&&37500>O[2]&&p.F&&p.v==0&&!p.C&&(p.C=po(g(p.Za,p),6e3));if(1>=kg(p.h)&&p.ca){try{p.ca()}catch{}p.ca=void 0}}else hs(p,11)}else if((a.K||p.g==a)&&xl(p),!y(h))for(O=p.Da.g.parse(h),h=0;h<O.length;h++){let ue=O[h];if(p.T=ue[0],ue=ue[1],p.G==2)if(ue[0]=="c"){p.K=ue[1],p.ia=ue[2];const st=ue[3];st!=null&&(p.la=st,p.j.info("VER="+p.la));const it=ue[4];it!=null&&(p.Aa=it,p.j.info("SVER="+p.Aa));const ri=ue[5];ri!=null&&typeof ri=="number"&&0<ri&&(v=1.5*ri,p.L=v,p.j.info("backChannelRequestTimeoutMs_="+v)),v=p;const an=a.g;if(an){const Sl=an.g?an.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Sl){var M=v.h;M.g||Sl.indexOf("spdy")==-1&&Sl.indexOf("quic")==-1&&Sl.indexOf("h2")==-1||(M.j=M.l,M.g=new Set,M.h&&(Nd(M,M.h),M.h=null))}if(v.D){const Md=an.g?an.g.getResponseHeader("X-HTTP-Session-Id"):null;Md&&(v.ya=Md,ve(v.I,v.D,Md))}}p.G=3,p.l&&p.l.ua(),p.ba&&(p.R=Date.now()-a.F,p.j.info("Handshake RTT: "+p.R+"ms")),v=p;var $=a;if(v.qa=Zg(v,v.J?v.ia:null,v.W),$.K){bg(v.h,$);var me=$,Qe=v.L;Qe&&(me.I=Qe),me.B&&(kd(me),pl(me)),v.g=$}else Kg(v);0<p.i.length&&Tl(p)}else ue[0]!="stop"&&ue[0]!="close"||hs(p,7);else p.G==3&&(ue[0]=="stop"||ue[0]=="close"?ue[0]=="stop"?hs(p,7):Pd(p):ue[0]!="noop"&&p.l&&p.l.ta(ue),p.v=0)}}fo(4)}catch{}}var j1=class{constructor(a,h){this.g=a,this.map=h}};function Sg(a){this.l=a||10,l.PerformanceNavigationTiming?(a=l.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Ag(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function kg(a){return a.h?1:a.g?a.g.size:0}function Cd(a,h){return a.h?a.h==h:a.g?a.g.has(h):!1}function Nd(a,h){a.g?a.g.add(h):a.h=h}function bg(a,h){a.h&&a.h==h?a.h=null:a.g&&a.g.has(h)&&a.g.delete(h)}Sg.prototype.cancel=function(){if(this.i=Cg(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Cg(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let h=a.i;for(const p of a.g.values())h=h.concat(p.D);return h}return C(a.i)}function L1(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map<"u"&&a instanceof Map||typeof Set<"u"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var h=[],p=a.length,v=0;v<p;v++)h.push(a[v]);return h}h=[],p=0;for(v in a)h[p++]=a[v];return h}function V1(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map<"u"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set<"u"&&a instanceof Set)){if(u(a)||typeof a=="string"){var h=[];a=a.length;for(var p=0;p<a;p++)h.push(p);return h}h=[],p=0;for(const v in a)h[p++]=v;return h}}}function Ng(a,h){if(a.forEach&&typeof a.forEach=="function")a.forEach(h,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,h,void 0);else for(var p=V1(a),v=L1(a),O=v.length,M=0;M<O;M++)h.call(void 0,v[M],p&&p[M],a)}var Rg=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function F1(a,h){if(a){a=a.split("&");for(var p=0;p<a.length;p++){var v=a[p].indexOf("="),O=null;if(0<=v){var M=a[p].substring(0,v);O=a[p].substring(v+1)}else M=a[p];h(M,O?decodeURIComponent(O.replace(/\+/g," ")):"")}}}function ds(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof ds){this.h=a.h,ml(this,a.j),this.o=a.o,this.g=a.g,gl(this,a.s),this.l=a.l;var h=a.i,p=new _o;p.i=h.i,h.g&&(p.g=new Map(h.g),p.h=h.h),Pg(this,p),this.m=a.m}else a&&(h=String(a).match(Rg))?(this.h=!1,ml(this,h[1]||"",!0),this.o=yo(h[2]||""),this.g=yo(h[3]||"",!0),gl(this,h[4]),this.l=yo(h[5]||"",!0),Pg(this,h[6]||"",!0),this.m=yo(h[7]||"")):(this.h=!1,this.i=new _o(null,this.h))}ds.prototype.toString=function(){var a=[],h=this.j;h&&a.push(vo(h,Dg,!0),":");var p=this.g;return(p||h=="file")&&(a.push("//"),(h=this.o)&&a.push(vo(h,Dg,!0),"@"),a.push(encodeURIComponent(String(p)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),p=this.s,p!=null&&a.push(":",String(p))),(p=this.l)&&(this.g&&p.charAt(0)!="/"&&a.push("/"),a.push(vo(p,p.charAt(0)=="/"?$1:B1,!0))),(p=this.i.toString())&&a.push("?",p),(p=this.m)&&a.push("#",vo(p,W1)),a.join("")};function Ln(a){return new ds(a)}function ml(a,h,p){a.j=p?yo(h,!0):h,a.j&&(a.j=a.j.replace(/:$/,""))}function gl(a,h){if(h){if(h=Number(h),isNaN(h)||0>h)throw Error("Bad port number "+h);a.s=h}else a.s=null}function Pg(a,h,p){h instanceof _o?(a.i=h,H1(a.i,a.h)):(p||(h=vo(h,z1)),a.i=new _o(h,a.h))}function ve(a,h,p){a.i.set(h,p)}function yl(a){return ve(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function yo(a,h){return a?h?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function vo(a,h,p){return typeof a=="string"?(a=encodeURI(a).replace(h,U1),p&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function U1(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Dg=/[#\/\?@]/g,B1=/[#\?:]/g,$1=/[#\?]/g,z1=/[#\?@]/g,W1=/#/g;function _o(a,h){this.h=this.g=null,this.i=a||null,this.j=!!h}function dr(a){a.g||(a.g=new Map,a.h=0,a.i&&F1(a.i,function(h,p){a.add(decodeURIComponent(h.replace(/\+/g," ")),p)}))}t=_o.prototype,t.add=function(a,h){dr(this),this.i=null,a=ti(this,a);var p=this.g.get(a);return p||this.g.set(a,p=[]),p.push(h),this.h+=1,this};function Og(a,h){dr(a),h=ti(a,h),a.g.has(h)&&(a.i=null,a.h-=a.g.get(h).length,a.g.delete(h))}function Mg(a,h){return dr(a),h=ti(a,h),a.g.has(h)}t.forEach=function(a,h){dr(this),this.g.forEach(function(p,v){p.forEach(function(O){a.call(h,O,v,this)},this)},this)},t.na=function(){dr(this);const a=Array.from(this.g.values()),h=Array.from(this.g.keys()),p=[];for(let v=0;v<h.length;v++){const O=a[v];for(let M=0;M<O.length;M++)p.push(h[v])}return p},t.V=function(a){dr(this);let h=[];if(typeof a=="string")Mg(this,a)&&(h=h.concat(this.g.get(ti(this,a))));else{a=Array.from(this.g.values());for(let p=0;p<a.length;p++)h=h.concat(a[p])}return h},t.set=function(a,h){return dr(this),this.i=null,a=ti(this,a),Mg(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[h]),this.h+=1,this},t.get=function(a,h){return a?(a=this.V(a),0<a.length?String(a[0]):h):h};function jg(a,h,p){Og(a,h),0<p.length&&(a.i=null,a.g.set(ti(a,h),C(p)),a.h+=p.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],h=Array.from(this.g.keys());for(var p=0;p<h.length;p++){var v=h[p];const M=encodeURIComponent(String(v)),$=this.V(v);for(v=0;v<$.length;v++){var O=M;$[v]!==""&&(O+="="+encodeURIComponent(String($[v]))),a.push(O)}}return this.i=a.join("&")};function ti(a,h){return h=String(h),a.j&&(h=h.toLowerCase()),h}function H1(a,h){h&&!a.j&&(dr(a),a.i=null,a.g.forEach(function(p,v){var O=v.toLowerCase();v!=O&&(Og(this,v),jg(this,O,p))},a)),a.j=h}function q1(a,h){const p=new mo;if(l.Image){const v=new Image;v.onload=x(hr,p,"TestLoadImage: loaded",!0,h,v),v.onerror=x(hr,p,"TestLoadImage: error",!1,h,v),v.onabort=x(hr,p,"TestLoadImage: abort",!1,h,v),v.ontimeout=x(hr,p,"TestLoadImage: timeout",!1,h,v),l.setTimeout(function(){v.ontimeout&&v.ontimeout()},1e4),v.src=a}else h(!1)}function G1(a,h){const p=new mo,v=new AbortController,O=setTimeout(()=>{v.abort(),hr(p,"TestPingServer: timeout",!1,h)},1e4);fetch(a,{signal:v.signal}).then(M=>{clearTimeout(O),M.ok?hr(p,"TestPingServer: ok",!0,h):hr(p,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(O),hr(p,"TestPingServer: error",!1,h)})}function hr(a,h,p,v,O){try{O&&(O.onload=null,O.onerror=null,O.onabort=null,O.ontimeout=null),v(p)}catch{}}function K1(){this.g=new N1}function Q1(a,h,p){const v=p||"";try{Ng(a,function(O,M){let $=O;c(O)&&($=wd(O)),h.push(v+M+"="+encodeURIComponent($))})}catch(O){throw h.push(v+"type="+encodeURIComponent("_badmap")),O}}function vl(a){this.l=a.Ub||null,this.j=a.eb||!1}A(vl,Ed),vl.prototype.g=function(){return new _l(this.l,this.j)},vl.prototype.i=function(a){return function(){return a}}({});function _l(a,h){rt.call(this),this.D=a,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}A(_l,rt),t=_l.prototype,t.open=function(a,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=h,this.readyState=1,Eo(this)},t.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const h={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(h.body=a),(this.D||l).fetch(new Request(this.A,h)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,wo(this)),this.readyState=0},t.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Eo(this)),this.g&&(this.readyState=3,Eo(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Lg(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function Lg(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}t.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var h=a.value?a.value:new Uint8Array(0);(h=this.v.decode(h,{stream:!a.done}))&&(this.response=this.responseText+=h)}a.done?wo(this):Eo(this),this.readyState==3&&Lg(this)}},t.Ra=function(a){this.g&&(this.response=this.responseText=a,wo(this))},t.Qa=function(a){this.g&&(this.response=a,wo(this))},t.ga=function(){this.g&&wo(this)};function wo(a){a.readyState=4,a.l=null,a.j=null,a.v=null,Eo(a)}t.setRequestHeader=function(a,h){this.u.append(a,h)},t.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],h=this.h.entries();for(var p=h.next();!p.done;)p=p.value,a.push(p[0]+": "+p[1]),p=h.next();return a.join(`\r
`)};function Eo(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(_l.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Vg(a){let h="";return j(a,function(p,v){h+=v,h+=":",h+=p,h+=`\r
`}),h}function Rd(a,h,p){e:{for(v in p){var v=!1;break e}v=!0}v||(p=Vg(p),typeof a=="string"?p!=null&&encodeURIComponent(String(p)):ve(a,h,p))}function be(a){rt.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}A(be,rt);var Y1=/^https?$/i,X1=["POST","PUT"];t=be.prototype,t.Ha=function(a){this.J=a},t.ea=function(a,h,p,v){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);h=h?h.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Id.g(),this.v=this.o?fg(this.o):fg(Id),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(h,String(a),!0),this.B=!1}catch(M){Fg(this,M);return}if(a=p||"",p=new Map(this.headers),v)if(Object.getPrototypeOf(v)===Object.prototype)for(var O in v)p.set(O,v[O]);else if(typeof v.keys=="function"&&typeof v.get=="function")for(const M of v.keys())p.set(M,v.get(M));else throw Error("Unknown input type for opt_headers: "+String(v));v=Array.from(p.keys()).find(M=>M.toLowerCase()=="content-type"),O=l.FormData&&a instanceof l.FormData,!(0<=Array.prototype.indexOf.call(X1,h,void 0))||v||O||p.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[M,$]of p)this.g.setRequestHeader(M,$);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{$g(this),this.u=!0,this.g.send(a),this.u=!1}catch(M){Fg(this,M)}};function Fg(a,h){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=h,a.m=5,Ug(a),wl(a)}function Ug(a){a.A||(a.A=!0,vt(a,"complete"),vt(a,"error"))}t.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,vt(this,"complete"),vt(this,"abort"),wl(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),wl(this,!0)),be.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?Bg(this):this.bb())},t.bb=function(){Bg(this)};function Bg(a){if(a.h&&typeof o<"u"&&(!a.v[1]||Vn(a)!=4||a.Z()!=2)){if(a.u&&Vn(a)==4)ug(a.Ea,0,a);else if(vt(a,"readystatechange"),Vn(a)==4){a.h=!1;try{const $=a.Z();e:switch($){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var p;if(!(p=h)){var v;if(v=$===0){var O=String(a.D).match(Rg)[1]||null;!O&&l.self&&l.self.location&&(O=l.self.location.protocol.slice(0,-1)),v=!Y1.test(O?O.toLowerCase():"")}p=v}if(p)vt(a,"complete"),vt(a,"success");else{a.m=6;try{var M=2<Vn(a)?a.g.statusText:""}catch{M=""}a.l=M+" ["+a.Z()+"]",Ug(a)}}finally{wl(a)}}}}function wl(a,h){if(a.g){$g(a);const p=a.g,v=a.v[0]?()=>{}:null;a.g=null,a.v=null,h||vt(a,"ready");try{p.onreadystatechange=v}catch{}}}function $g(a){a.I&&(l.clearTimeout(a.I),a.I=null)}t.isActive=function(){return!!this.g};function Vn(a){return a.g?a.g.readyState:0}t.Z=function(){try{return 2<Vn(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(a){if(this.g){var h=this.g.responseText;return a&&h.indexOf(a)==0&&(h=h.substring(a.length)),C1(h)}};function zg(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function J1(a){const h={};a=(a.g&&2<=Vn(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let v=0;v<a.length;v++){if(y(a[v]))continue;var p=b(a[v]);const O=p[0];if(p=p[1],typeof p!="string")continue;p=p.trim();const M=h[O]||[];h[O]=M,M.push(p)}I(h,function(v){return v.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function To(a,h,p){return p&&p.internalChannelParams&&p.internalChannelParams[a]||h}function Wg(a){this.Aa=0,this.i=[],this.j=new mo,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=To("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=To("baseRetryDelayMs",5e3,a),this.cb=To("retryDelaySeedMs",1e4,a),this.Wa=To("forwardChannelMaxRetries",2,a),this.wa=To("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new Sg(a&&a.concurrentRequestLimit),this.Da=new K1,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=Wg.prototype,t.la=8,t.G=1,t.connect=function(a,h,p,v){_t(0),this.W=a,this.H=h||{},p&&v!==void 0&&(this.H.OSID=p,this.H.OAID=v),this.F=this.X,this.I=Zg(this,null,this.W),Tl(this)};function Pd(a){if(Hg(a),a.G==3){var h=a.U++,p=Ln(a.I);if(ve(p,"SID",a.K),ve(p,"RID",h),ve(p,"TYPE","terminate"),xo(a,p),h=new cr(a,a.j,h),h.L=2,h.v=yl(Ln(p)),p=!1,l.navigator&&l.navigator.sendBeacon)try{p=l.navigator.sendBeacon(h.v.toString(),"")}catch{}!p&&l.Image&&(new Image().src=h.v,p=!0),p||(h.g=ey(h.j,null),h.g.ea(h.v)),h.F=Date.now(),pl(h)}Jg(a)}function El(a){a.g&&(Od(a),a.g.cancel(),a.g=null)}function Hg(a){El(a),a.u&&(l.clearTimeout(a.u),a.u=null),xl(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&l.clearTimeout(a.s),a.s=null)}function Tl(a){if(!Ag(a.h)&&!a.s){a.s=!0;var h=a.Ga;At||Z(),z||(At(),z=!0),Q.add(h,a),a.B=0}}function Z1(a,h){return kg(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=h.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=po(g(a.Ga,a,h),Xg(a,a.B)),a.B++,!0)}t.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;const O=new cr(this,this.j,a);let M=this.o;if(this.S&&(M?(M=w(M),T(M,this.S)):M=this.S),this.m!==null||this.O||(O.H=M,M=null),this.P)e:{for(var h=0,p=0;p<this.i.length;p++){t:{var v=this.i[p];if("__data__"in v.map&&(v=v.map.__data__,typeof v=="string")){v=v.length;break t}v=void 0}if(v===void 0)break;if(h+=v,4096<h){h=p;break e}if(h===4096||p===this.i.length-1){h=p+1;break e}}h=1e3}else h=1e3;h=Gg(this,O,h),p=Ln(this.I),ve(p,"RID",a),ve(p,"CVER",22),this.D&&ve(p,"X-HTTP-Session-Id",this.D),xo(this,p),M&&(this.O?h="headers="+encodeURIComponent(String(Vg(M)))+"&"+h:this.m&&Rd(p,this.m,M)),Nd(this.h,O),this.Ua&&ve(p,"TYPE","init"),this.P?(ve(p,"$req",h),ve(p,"SID","null"),O.T=!0,Ad(O,p,null)):Ad(O,p,h),this.G=2}}else this.G==3&&(a?qg(this,a):this.i.length==0||Ag(this.h)||qg(this))};function qg(a,h){var p;h?p=h.l:p=a.U++;const v=Ln(a.I);ve(v,"SID",a.K),ve(v,"RID",p),ve(v,"AID",a.T),xo(a,v),a.m&&a.o&&Rd(v,a.m,a.o),p=new cr(a,a.j,p,a.B+1),a.m===null&&(p.H=a.o),h&&(a.i=h.D.concat(a.i)),h=Gg(a,p,1e3),p.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),Nd(a.h,p),Ad(p,v,h)}function xo(a,h){a.H&&j(a.H,function(p,v){ve(h,v,p)}),a.l&&Ng({},function(p,v){ve(h,v,p)})}function Gg(a,h,p){p=Math.min(a.i.length,p);var v=a.l?g(a.l.Na,a.l,a):null;e:{var O=a.i;let M=-1;for(;;){const $=["count="+p];M==-1?0<p?(M=O[0].g,$.push("ofs="+M)):M=0:$.push("ofs="+M);let me=!0;for(let Qe=0;Qe<p;Qe++){let ue=O[Qe].g;const st=O[Qe].map;if(ue-=M,0>ue)M=Math.max(0,O[Qe].g-100),me=!1;else try{Q1(st,$,"req"+ue+"_")}catch{v&&v(st)}}if(me){v=$.join("&");break e}}}return a=a.i.splice(0,p),h.D=a,v}function Kg(a){if(!a.g&&!a.u){a.Y=1;var h=a.Fa;At||Z(),z||(At(),z=!0),Q.add(h,a),a.v=0}}function Dd(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=po(g(a.Fa,a),Xg(a,a.v)),a.v++,!0)}t.Fa=function(){if(this.u=null,Qg(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=po(g(this.ab,this),a)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,_t(10),El(this),Qg(this))};function Od(a){a.A!=null&&(l.clearTimeout(a.A),a.A=null)}function Qg(a){a.g=new cr(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var h=Ln(a.qa);ve(h,"RID","rpc"),ve(h,"SID",a.K),ve(h,"AID",a.T),ve(h,"CI",a.F?"0":"1"),!a.F&&a.ja&&ve(h,"TO",a.ja),ve(h,"TYPE","xmlhttp"),xo(a,h),a.m&&a.o&&Rd(h,a.m,a.o),a.L&&(a.g.I=a.L);var p=a.g;a=a.ia,p.L=1,p.v=yl(Ln(h)),p.m=null,p.P=!0,Tg(p,a)}t.Za=function(){this.C!=null&&(this.C=null,El(this),Dd(this),_t(19))};function xl(a){a.C!=null&&(l.clearTimeout(a.C),a.C=null)}function Yg(a,h){var p=null;if(a.g==h){xl(a),Od(a),a.g=null;var v=2}else if(Cd(a.h,h))p=h.D,bg(a.h,h),v=1;else return;if(a.G!=0){if(h.o)if(v==1){p=h.m?h.m.length:0,h=Date.now()-h.F;var O=a.B;v=dl(),vt(v,new vg(v,p)),Tl(a)}else Kg(a);else if(O=h.s,O==3||O==0&&0<h.X||!(v==1&&Z1(a,h)||v==2&&Dd(a)))switch(p&&0<p.length&&(h=a.h,h.i=h.i.concat(p)),O){case 1:hs(a,5);break;case 4:hs(a,10);break;case 3:hs(a,6);break;default:hs(a,2)}}}function Xg(a,h){let p=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(p*=2),p*h}function hs(a,h){if(a.j.info("Error code "+h),h==2){var p=g(a.fb,a),v=a.Xa;const O=!v;v=new ds(v||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||ml(v,"https"),yl(v),O?q1(v.toString(),p):G1(v.toString(),p)}else _t(2);a.G=0,a.l&&a.l.sa(h),Jg(a),Hg(a)}t.fb=function(a){a?(this.j.info("Successfully pinged google.com"),_t(2)):(this.j.info("Failed to ping google.com"),_t(1))};function Jg(a){if(a.G=0,a.ka=[],a.l){const h=Cg(a.h);(h.length!=0||a.i.length!=0)&&(N(a.ka,h),N(a.ka,a.i),a.h.i.length=0,C(a.i),a.i.length=0),a.l.ra()}}function Zg(a,h,p){var v=p instanceof ds?Ln(p):new ds(p);if(v.g!="")h&&(v.g=h+"."+v.g),gl(v,v.s);else{var O=l.location;v=O.protocol,h=h?h+"."+O.hostname:O.hostname,O=+O.port;var M=new ds(null);v&&ml(M,v),h&&(M.g=h),O&&gl(M,O),p&&(M.l=p),v=M}return p=a.D,h=a.ya,p&&h&&ve(v,p,h),ve(v,"VER",a.la),xo(a,v),v}function ey(a,h,p){if(h&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return h=a.Ca&&!a.pa?new be(new vl({eb:p})):new be(a.pa),h.Ha(a.J),h}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function ty(){}t=ty.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function Il(){}Il.prototype.g=function(a,h){return new jt(a,h)};function jt(a,h){rt.call(this),this.g=new Wg(h),this.l=a,this.h=h&&h.messageUrlParams||null,a=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(a?a["X-WebChannel-Content-Type"]=h.messageContentType:a={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.va&&(a?a["X-WebChannel-Client-Profile"]=h.va:a={"X-WebChannel-Client-Profile":h.va}),this.g.S=a,(a=h&&h.Sb)&&!y(a)&&(this.g.m=a),this.v=h&&h.supportsCrossDomainXhr||!1,this.u=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!y(h)&&(this.g.D=h,a=this.h,a!==null&&h in a&&(a=this.h,h in a&&delete a[h])),this.j=new ni(this)}A(jt,rt),jt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},jt.prototype.close=function(){Pd(this.g)},jt.prototype.o=function(a){var h=this.g;if(typeof a=="string"){var p={};p.__data__=a,a=p}else this.u&&(p={},p.__data__=wd(a),a=p);h.i.push(new j1(h.Ya++,a)),h.G==3&&Tl(h)},jt.prototype.N=function(){this.g.l=null,delete this.j,Pd(this.g),delete this.g,jt.aa.N.call(this)};function ny(a){Td.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var h=a.__sm__;if(h){e:{for(const p in h){a=p;break e}a=void 0}(this.i=a)&&(a=this.i,h=h!==null&&a in h?h[a]:void 0),this.data=h}else this.data=a}A(ny,Td);function ry(){xd.call(this),this.status=1}A(ry,xd);function ni(a){this.g=a}A(ni,ty),ni.prototype.ua=function(){vt(this.g,"a")},ni.prototype.ta=function(a){vt(this.g,new ny(a))},ni.prototype.sa=function(a){vt(this.g,new ry)},ni.prototype.ra=function(){vt(this.g,"b")},Il.prototype.createWebChannel=Il.prototype.g,jt.prototype.send=jt.prototype.o,jt.prototype.open=jt.prototype.m,jt.prototype.close=jt.prototype.close,mT=function(){return new Il},pT=function(){return dl()},fT=us,Df={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},hl.NO_ERROR=0,hl.TIMEOUT=8,hl.HTTP_ERROR=6,du=hl,_g.COMPLETE="complete",hT=_g,pg.EventType=ho,ho.OPEN="a",ho.CLOSE="b",ho.ERROR="c",ho.MESSAGE="d",rt.prototype.listen=rt.prototype.K,zo=pg,be.prototype.listenOnce=be.prototype.L,be.prototype.getLastError=be.prototype.Ka,be.prototype.getLastErrorCode=be.prototype.Ba,be.prototype.getStatus=be.prototype.Z,be.prototype.getResponseJson=be.prototype.Oa,be.prototype.getResponseText=be.prototype.oa,be.prototype.send=be.prototype.ea,be.prototype.setWithCredentials=be.prototype.Ha,dT=be}).apply(typeof zl<"u"?zl:typeof self<"u"?self:typeof window<"u"?window:{});const Pv="@firebase/firestore",Dv="4.8.0";/**
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
 */class ut{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}ut.UNAUTHENTICATED=new ut(null),ut.GOOGLE_CREDENTIALS=new ut("google-credentials-uid"),ut.FIRST_PARTY=new ut("first-party-uid"),ut.MOCK_USER=new ut("mock-user");/**
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
 */let no="11.10.0";/**
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
 */const js=new Zp("@firebase/firestore");function ai(){return js.logLevel}function H(t,...e){if(js.logLevel<=se.DEBUG){const n=e.map(tm);js.debug(`Firestore (${no}): ${t}`,...n)}}function nr(t,...e){if(js.logLevel<=se.ERROR){const n=e.map(tm);js.error(`Firestore (${no}): ${t}`,...n)}}function Wr(t,...e){if(js.logLevel<=se.WARN){const n=e.map(tm);js.warn(`Firestore (${no}): ${t}`,...n)}}function tm(t){if(typeof t=="string")return t;try{/**
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
 */function Y(t,e,n){let r="Unexpected state";typeof e=="string"?r=e:n=e,gT(t,r,n)}function gT(t,e,n){let r=`FIRESTORE (${no}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{r+=" CONTEXT: "+JSON.stringify(n)}catch{r+=" CONTEXT: "+n}throw nr(r),new Error(r)}function de(t,e,n,r){let s="Unexpected state";typeof n=="string"?s=n:r=n,t||gT(e,s,r)}function ee(t,e){return t}/**
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
 */const L={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class W extends nn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class Ur{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
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
 */class yT{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class fN{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(ut.UNAUTHENTICATED))}shutdown(){}}class pN{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class mN{constructor(e){this.t=e,this.currentUser=ut.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){de(this.o===void 0,42304);let r=this.i;const s=u=>this.i!==r?(r=this.i,n(u)):Promise.resolve();let i=new Ur;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Ur,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const u=i;e.enqueueRetryable(async()=>{await u.promise,await s(this.currentUser)})},l=u=>{H("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>l(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?l(u):(H("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Ur)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(H("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(de(typeof r.accessToken=="string",31837,{l:r}),new yT(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return de(e===null||typeof e=="string",2055,{h:e}),new ut(e)}}class gN{constructor(e,n,r){this.P=e,this.T=n,this.I=r,this.type="FirstParty",this.user=ut.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class yN{constructor(e,n,r){this.P=e,this.T=n,this.I=r}getToken(){return Promise.resolve(new gN(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(ut.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Ov{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class vN{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,ht(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){de(this.o===void 0,3512);const r=i=>{i.error!=null&&H("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,H("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{H("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):H("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Ov(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(de(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new Ov(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function _N(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
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
 */function vT(){return new TextEncoder}/**
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
 */class nm{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=_N(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<n&&(r+=e.charAt(s[i]%62))}return r}}function ne(t,e){return t<e?-1:t>e?1:0}function Of(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=t.codePointAt(n),s=e.codePointAt(n);if(r!==s){if(r<128&&s<128)return ne(r,s);{const i=vT(),o=wN(i.encode(Mv(t,n)),i.encode(Mv(e,n)));return o!==0?o:ne(r,s)}}n+=r>65535?2:1}return ne(t.length,e.length)}function Mv(t,e){return t.codePointAt(e)>65535?t.substring(e,e+2):t.substring(e,e+1)}function wN(t,e){for(let n=0;n<t.length&&n<e.length;++n)if(t[n]!==e[n])return ne(t[n],e[n]);return ne(t.length,e.length)}function $i(t,e,n){return t.length===e.length&&t.every((r,s)=>n(r,e[s]))}/**
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
 */const jv="__name__";class Tn{constructor(e,n,r){n===void 0?n=0:n>e.length&&Y(637,{offset:n,range:e.length}),r===void 0?r=e.length-n:r>e.length-n&&Y(1746,{length:r,range:e.length-n}),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return Tn.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof Tn?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let s=0;s<r;s++){const i=Tn.compareSegments(e.get(s),n.get(s));if(i!==0)return i}return ne(e.length,n.length)}static compareSegments(e,n){const r=Tn.isNumericId(e),s=Tn.isNumericId(n);return r&&!s?-1:!r&&s?1:r&&s?Tn.extractNumericId(e).compare(Tn.extractNumericId(n)):Of(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Fr.fromString(e.substring(4,e.length-2))}}class ge extends Tn{construct(e,n,r){return new ge(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new W(L.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(s=>s.length>0))}return new ge(n)}static emptyPath(){return new ge([])}}const EN=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Je extends Tn{construct(e,n,r){return new Je(e,n,r)}static isValidIdentifier(e){return EN.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Je.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===jv}static keyField(){return new Je([jv])}static fromServerFormat(e){const n=[];let r="",s=0;const i=()=>{if(r.length===0)throw new W(L.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let o=!1;for(;s<e.length;){const l=e[s];if(l==="\\"){if(s+1===e.length)throw new W(L.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new W(L.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else l==="`"?(o=!o,s++):l!=="."||o?(r+=l,s++):(i(),s++)}if(i(),o)throw new W(L.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Je(n)}static emptyPath(){return new Je([])}}/**
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
 */class G{constructor(e){this.path=e}static fromPath(e){return new G(ge.fromString(e))}static fromName(e){return new G(ge.fromString(e).popFirst(5))}static empty(){return new G(ge.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ge.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return ge.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new G(new ge(e.slice()))}}/**
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
 */function _T(t,e,n){if(!n)throw new W(L.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function TN(t,e,n,r){if(e===!0&&r===!0)throw new W(L.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function Lv(t){if(!G.isDocumentKey(t))throw new W(L.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function Vv(t){if(G.isDocumentKey(t))throw new W(L.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function wT(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function Bc(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":Y(12329,{type:typeof t})}function Yn(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new W(L.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=Bc(t);throw new W(L.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function xN(t,e){if(e<=0)throw new W(L.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}/**
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
 */function Fe(t,e){const n={typeString:t};return e&&(n.value=e),n}function Xa(t,e){if(!wT(t))throw new W(L.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in t)){n=`JSON missing required field: '${r}'`;break}const o=t[r];if(s&&typeof o!==s){n=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){n=`Expected '${r}' field to equal '${i.value}'`;break}}if(n)throw new W(L.INVALID_ARGUMENT,n);return!0}/**
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
 */const Fv=-62135596800,Uv=1e6;class we{static now(){return we.fromMillis(Date.now())}static fromDate(e){return we.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor((e-1e3*n)*Uv);return new we(n,r)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new W(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new W(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<Fv)throw new W(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new W(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Uv}_compareTo(e){return this.seconds===e.seconds?ne(this.nanoseconds,e.nanoseconds):ne(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:we._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Xa(e,we._jsonSchema))return new we(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Fv;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}we._jsonSchemaVersion="firestore/timestamp/1.0",we._jsonSchema={type:Fe("string",we._jsonSchemaVersion),seconds:Fe("number"),nanoseconds:Fe("number")};/**
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
 */class X{static fromTimestamp(e){return new X(e)}static min(){return new X(new we(0,0))}static max(){return new X(new we(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */const Ra=-1;function IN(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,s=X.fromTimestamp(r===1e9?new we(n+1,0):new we(n,r));return new Hr(s,G.empty(),e)}function SN(t){return new Hr(t.readTime,t.key,Ra)}class Hr{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new Hr(X.min(),G.empty(),Ra)}static max(){return new Hr(X.max(),G.empty(),Ra)}}function AN(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=G.comparator(t.documentKey,e.documentKey),n!==0?n:ne(t.largestBatchId,e.largestBatchId))}/**
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
 */const kN="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class bN{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function ro(t){if(t.code!==L.FAILED_PRECONDITION||t.message!==kN)throw t;H("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class F{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&Y(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new F((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(n,i).next(r,s)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof F?n:F.resolve(n)}catch(n){return F.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):F.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):F.reject(n)}static resolve(e){return new F((n,r)=>{n(e)})}static reject(e){return new F((n,r)=>{r(e)})}static waitFor(e){return new F((n,r)=>{let s=0,i=0,o=!1;e.forEach(l=>{++s,l.next(()=>{++i,o&&i===s&&n()},u=>r(u))}),o=!0,i===s&&n()})}static or(e){let n=F.resolve(!1);for(const r of e)n=n.next(s=>s?F.resolve(s):r());return n}static forEach(e,n){const r=[];return e.forEach((s,i)=>{r.push(n.call(this,s,i))}),this.waitFor(r)}static mapArray(e,n){return new F((r,s)=>{const i=e.length,o=new Array(i);let l=0;for(let u=0;u<i;u++){const c=u;n(e[c]).next(f=>{o[c]=f,++l,l===i&&r(o)},f=>s(f))}})}static doWhile(e,n){return new F((r,s)=>{const i=()=>{e()===!0?n().next(()=>{i()},s):r()};i()})}}function CN(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function so(t){return t.name==="IndexedDbTransactionError"}/**
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
 */class $c{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this._e(r),this.ae=r=>n.writeSequenceNumber(r))}_e(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ae&&this.ae(e),e}}$c.ue=-1;/**
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
 */const rm=-1;function zc(t){return t==null}function Yu(t){return t===0&&1/t==-1/0}function NN(t){return typeof t=="number"&&Number.isInteger(t)&&!Yu(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
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
 */const ET="";function RN(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=Bv(e)),e=PN(t.get(n),e);return Bv(e)}function PN(t,e){let n=e;const r=t.length;for(let s=0;s<r;s++){const i=t.charAt(s);switch(i){case"\0":n+="";break;case ET:n+="";break;default:n+=i}}return n}function Bv(t){return t+ET+""}/**
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
 */function $v(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function ns(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function TT(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
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
 */class ke{constructor(e,n){this.comparator=e,this.root=n||Xe.EMPTY}insert(e,n){return new ke(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,Xe.BLACK,null,null))}remove(e){return new ke(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Xe.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return n+r.left.size;s<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Wl(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Wl(this.root,e,this.comparator,!1)}getReverseIterator(){return new Wl(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Wl(this.root,e,this.comparator,!0)}}class Wl{constructor(e,n,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=n?r(e.key,n):1,n&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Xe{constructor(e,n,r,s,i){this.key=e,this.value=n,this.color=r??Xe.RED,this.left=s??Xe.EMPTY,this.right=i??Xe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,s,i){return new Xe(e??this.key,n??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,n,r),null):i===0?s.copy(null,n,null,null,null):s.copy(null,null,null,null,s.right.insert(e,n,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Xe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,s=this;if(n(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,n),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),n(e,s.key)===0){if(s.right.isEmpty())return Xe.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,n))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Xe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Xe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Y(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Y(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw Y(27949);return e+(this.isRed()?0:1)}}Xe.EMPTY=null,Xe.RED=!0,Xe.BLACK=!1;Xe.EMPTY=new class{constructor(){this.size=0}get key(){throw Y(57766)}get value(){throw Y(16141)}get color(){throw Y(16727)}get left(){throw Y(29726)}get right(){throw Y(36894)}copy(e,n,r,s,i){return this}insert(e,n,r){return new Xe(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class We{constructor(e){this.comparator=e,this.data=new ke(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;n(s.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new zv(this.data.getIterator())}getIteratorFrom(e){return new zv(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof We)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new We(this.comparator);return n.data=e,n}}class zv{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class Ft{constructor(e){this.fields=e,e.sort(Je.comparator)}static empty(){return new Ft([])}unionWith(e){let n=new We(Je.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new Ft(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return $i(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
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
 */class xT extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class tt{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new xT("Invalid base64 string: "+i):i}}(e);return new tt(n)}static fromUint8Array(e){const n=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new tt(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let s=0;s<n.length;s++)r[s]=n.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return ne(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}tt.EMPTY_BYTE_STRING=new tt("");const DN=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function qr(t){if(de(!!t,39018),typeof t=="string"){let e=0;const n=DN.exec(t);if(de(!!n,46558,{timestamp:t}),n[1]){let s=n[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:De(t.seconds),nanos:De(t.nanos)}}function De(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Gr(t){return typeof t=="string"?tt.fromBase64String(t):tt.fromUint8Array(t)}/**
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
 */const IT="server_timestamp",ST="__type__",AT="__previous_value__",kT="__local_write_time__";function sm(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{})[ST])===null||n===void 0?void 0:n.stringValue)===IT}function Wc(t){const e=t.mapValue.fields[AT];return sm(e)?Wc(e):e}function Pa(t){const e=qr(t.mapValue.fields[kT].timestampValue);return new we(e.seconds,e.nanos)}/**
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
 */class ON{constructor(e,n,r,s,i,o,l,u,c,f){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=u,this.useFetchStreams=c,this.isUsingEmulator=f}}const Xu="(default)";class Da{constructor(e,n){this.projectId=e,this.database=n||Xu}static empty(){return new Da("","")}get isDefaultDatabase(){return this.database===Xu}isEqual(e){return e instanceof Da&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */const bT="__type__",MN="__max__",Hl={mapValue:{}},CT="__vector__",Ju="value";function Kr(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?sm(t)?4:LN(t)?9007199254740991:jN(t)?10:11:Y(28295,{value:t})}function Mn(t,e){if(t===e)return!0;const n=Kr(t);if(n!==Kr(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Pa(t).isEqual(Pa(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=qr(s.timestampValue),l=qr(i.timestampValue);return o.seconds===l.seconds&&o.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(s,i){return Gr(s.bytesValue).isEqual(Gr(i.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(s,i){return De(s.geoPointValue.latitude)===De(i.geoPointValue.latitude)&&De(s.geoPointValue.longitude)===De(i.geoPointValue.longitude)}(t,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return De(s.integerValue)===De(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=De(s.doubleValue),l=De(i.doubleValue);return o===l?Yu(o)===Yu(l):isNaN(o)&&isNaN(l)}return!1}(t,e);case 9:return $i(t.arrayValue.values||[],e.arrayValue.values||[],Mn);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},l=i.mapValue.fields||{};if($v(o)!==$v(l))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(l[u]===void 0||!Mn(o[u],l[u])))return!1;return!0}(t,e);default:return Y(52216,{left:t})}}function Oa(t,e){return(t.values||[]).find(n=>Mn(n,e))!==void 0}function zi(t,e){if(t===e)return 0;const n=Kr(t),r=Kr(e);if(n!==r)return ne(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return ne(t.booleanValue,e.booleanValue);case 2:return function(i,o){const l=De(i.integerValue||i.doubleValue),u=De(o.integerValue||o.doubleValue);return l<u?-1:l>u?1:l===u?0:isNaN(l)?isNaN(u)?0:-1:1}(t,e);case 3:return Wv(t.timestampValue,e.timestampValue);case 4:return Wv(Pa(t),Pa(e));case 5:return Of(t.stringValue,e.stringValue);case 6:return function(i,o){const l=Gr(i),u=Gr(o);return l.compareTo(u)}(t.bytesValue,e.bytesValue);case 7:return function(i,o){const l=i.split("/"),u=o.split("/");for(let c=0;c<l.length&&c<u.length;c++){const f=ne(l[c],u[c]);if(f!==0)return f}return ne(l.length,u.length)}(t.referenceValue,e.referenceValue);case 8:return function(i,o){const l=ne(De(i.latitude),De(o.latitude));return l!==0?l:ne(De(i.longitude),De(o.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return Hv(t.arrayValue,e.arrayValue);case 10:return function(i,o){var l,u,c,f;const m=i.fields||{},g=o.fields||{},x=(l=m[Ju])===null||l===void 0?void 0:l.arrayValue,A=(u=g[Ju])===null||u===void 0?void 0:u.arrayValue,C=ne(((c=x==null?void 0:x.values)===null||c===void 0?void 0:c.length)||0,((f=A==null?void 0:A.values)===null||f===void 0?void 0:f.length)||0);return C!==0?C:Hv(x,A)}(t.mapValue,e.mapValue);case 11:return function(i,o){if(i===Hl.mapValue&&o===Hl.mapValue)return 0;if(i===Hl.mapValue)return 1;if(o===Hl.mapValue)return-1;const l=i.fields||{},u=Object.keys(l),c=o.fields||{},f=Object.keys(c);u.sort(),f.sort();for(let m=0;m<u.length&&m<f.length;++m){const g=Of(u[m],f[m]);if(g!==0)return g;const x=zi(l[u[m]],c[f[m]]);if(x!==0)return x}return ne(u.length,f.length)}(t.mapValue,e.mapValue);default:throw Y(23264,{le:n})}}function Wv(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return ne(t,e);const n=qr(t),r=qr(e),s=ne(n.seconds,r.seconds);return s!==0?s:ne(n.nanos,r.nanos)}function Hv(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const i=zi(n[s],r[s]);if(i)return i}return ne(n.length,r.length)}function Wi(t){return Mf(t)}function Mf(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=qr(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Gr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return G.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",s=!0;for(const i of n.values||[])s?s=!1:r+=",",r+=Mf(i);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${Mf(n.fields[o])}`;return s+"}"}(t.mapValue):Y(61005,{value:t})}function hu(t){switch(Kr(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Wc(t);return e?16+hu(e):16;case 5:return 2*t.stringValue.length;case 6:return Gr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((s,i)=>s+hu(i),0)}(t.arrayValue);case 10:case 11:return function(r){let s=0;return ns(r.fields,(i,o)=>{s+=i.length+hu(o)}),s}(t.mapValue);default:throw Y(13486,{value:t})}}function qv(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function jf(t){return!!t&&"integerValue"in t}function im(t){return!!t&&"arrayValue"in t}function Gv(t){return!!t&&"nullValue"in t}function Kv(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function fu(t){return!!t&&"mapValue"in t}function jN(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{})[bT])===null||n===void 0?void 0:n.stringValue)===CT}function sa(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return ns(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=sa(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=sa(t.arrayValue.values[n]);return e}return Object.assign({},t)}function LN(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===MN}/**
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
 */class Nt{constructor(e){this.value=e}static empty(){return new Nt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!fu(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=sa(n)}setAll(e){let n=Je.emptyPath(),r={},s=[];e.forEach((o,l)=>{if(!n.isImmediateParentOf(l)){const u=this.getFieldsMap(n);this.applyChanges(u,r,s),r={},s=[],n=l.popLast()}o?r[l.lastSegment()]=sa(o):s.push(l.lastSegment())});const i=this.getFieldsMap(n);this.applyChanges(i,r,s)}delete(e){const n=this.field(e.popLast());fu(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return Mn(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=n.mapValue.fields[e.get(r)];fu(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=s),n=s}return n.mapValue.fields}applyChanges(e,n,r){ns(n,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new Nt(sa(this.value))}}function NT(t){const e=[];return ns(t.fields,(n,r)=>{const s=new Je([n]);if(fu(r)){const i=NT(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new Ft(e)}/**
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
 */class dt{constructor(e,n,r,s,i,o,l){this.key=e,this.documentType=n,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=l}static newInvalidDocument(e){return new dt(e,0,X.min(),X.min(),X.min(),Nt.empty(),0)}static newFoundDocument(e,n,r,s){return new dt(e,1,n,X.min(),r,s,0)}static newNoDocument(e,n){return new dt(e,2,n,X.min(),X.min(),Nt.empty(),0)}static newUnknownDocument(e,n){return new dt(e,3,n,X.min(),X.min(),Nt.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(X.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Nt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Nt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=X.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof dt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new dt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Zu{constructor(e,n){this.position=e,this.inclusive=n}}function Qv(t,e,n){let r=0;for(let s=0;s<t.position.length;s++){const i=e[s],o=t.position[s];if(i.field.isKeyField()?r=G.comparator(G.fromName(o.referenceValue),n.key):r=zi(o,n.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function Yv(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!Mn(t.position[n],e.position[n]))return!1;return!0}/**
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
 */class Ma{constructor(e,n="asc"){this.field=e,this.dir=n}}function VN(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
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
 */class RT{}class Ve extends RT{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new UN(e,n,r):n==="array-contains"?new zN(e,r):n==="in"?new WN(e,r):n==="not-in"?new HN(e,r):n==="array-contains-any"?new qN(e,r):new Ve(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new BN(e,r):new $N(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(zi(n,this.value)):n!==null&&Kr(this.value)===Kr(n)&&this.matchesComparison(zi(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Y(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class yn extends RT{constructor(e,n){super(),this.filters=e,this.op=n,this.he=null}static create(e,n){return new yn(e,n)}matches(e){return PT(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.he!==null||(this.he=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function PT(t){return t.op==="and"}function DT(t){return FN(t)&&PT(t)}function FN(t){for(const e of t.filters)if(e instanceof yn)return!1;return!0}function Lf(t){if(t instanceof Ve)return t.field.canonicalString()+t.op.toString()+Wi(t.value);if(DT(t))return t.filters.map(e=>Lf(e)).join(",");{const e=t.filters.map(n=>Lf(n)).join(",");return`${t.op}(${e})`}}function OT(t,e){return t instanceof Ve?function(r,s){return s instanceof Ve&&r.op===s.op&&r.field.isEqual(s.field)&&Mn(r.value,s.value)}(t,e):t instanceof yn?function(r,s){return s instanceof yn&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,o,l)=>i&&OT(o,s.filters[l]),!0):!1}(t,e):void Y(19439)}function MT(t){return t instanceof Ve?function(n){return`${n.field.canonicalString()} ${n.op} ${Wi(n.value)}`}(t):t instanceof yn?function(n){return n.op.toString()+" {"+n.getFilters().map(MT).join(" ,")+"}"}(t):"Filter"}class UN extends Ve{constructor(e,n,r){super(e,n,r),this.key=G.fromName(r.referenceValue)}matches(e){const n=G.comparator(e.key,this.key);return this.matchesComparison(n)}}class BN extends Ve{constructor(e,n){super(e,"in",n),this.keys=jT("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class $N extends Ve{constructor(e,n){super(e,"not-in",n),this.keys=jT("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function jT(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>G.fromName(r.referenceValue))}class zN extends Ve{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return im(n)&&Oa(n.arrayValue,this.value)}}class WN extends Ve{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&Oa(this.value.arrayValue,n)}}class HN extends Ve{constructor(e,n){super(e,"not-in",n)}matches(e){if(Oa(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Oa(this.value.arrayValue,n)}}class qN extends Ve{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!im(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>Oa(this.value.arrayValue,r))}}/**
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
 */class GN{constructor(e,n=null,r=[],s=[],i=null,o=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=l,this.Pe=null}}function Xv(t,e=null,n=[],r=[],s=null,i=null,o=null){return new GN(t,e,n,r,s,i,o)}function om(t){const e=ee(t);if(e.Pe===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>Lf(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),zc(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>Wi(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>Wi(r)).join(",")),e.Pe=n}return e.Pe}function am(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!VN(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!OT(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!Yv(t.startAt,e.startAt)&&Yv(t.endAt,e.endAt)}function Vf(t){return G.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
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
 */class io{constructor(e,n=null,r=[],s=[],i=null,o="F",l=null,u=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=l,this.endAt=u,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function KN(t,e,n,r,s,i,o,l){return new io(t,e,n,r,s,i,o,l)}function lm(t){return new io(t)}function Jv(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function LT(t){return t.collectionGroup!==null}function ia(t){const e=ee(t);if(e.Te===null){e.Te=[];const n=new Set;for(const i of e.explicitOrderBy)e.Te.push(i),n.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let l=new We(Je.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(c=>{c.isInequality()&&(l=l.add(c.field))})}),l})(e).forEach(i=>{n.has(i.canonicalString())||i.isKeyField()||e.Te.push(new Ma(i,r))}),n.has(Je.keyField().canonicalString())||e.Te.push(new Ma(Je.keyField(),r))}return e.Te}function bn(t){const e=ee(t);return e.Ie||(e.Ie=QN(e,ia(t))),e.Ie}function QN(t,e){if(t.limitType==="F")return Xv(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Ma(s.field,i)});const n=t.endAt?new Zu(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new Zu(t.startAt.position,t.startAt.inclusive):null;return Xv(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function Ff(t,e){const n=t.filters.concat([e]);return new io(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function ec(t,e,n){return new io(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function Hc(t,e){return am(bn(t),bn(e))&&t.limitType===e.limitType}function VT(t){return`${om(bn(t))}|lt:${t.limitType}`}function li(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(s=>MT(s)).join(", ")}]`),zc(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(s=>Wi(s)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(s=>Wi(s)).join(",")),`Target(${r})`}(bn(t))}; limitType=${t.limitType})`}function qc(t,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):G.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(t,e)&&function(r,s){for(const i of ia(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(t,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(t,e)&&function(r,s){return!(r.startAt&&!function(o,l,u){const c=Qv(o,l,u);return o.inclusive?c<=0:c<0}(r.startAt,ia(r),s)||r.endAt&&!function(o,l,u){const c=Qv(o,l,u);return o.inclusive?c>=0:c>0}(r.endAt,ia(r),s))}(t,e)}function YN(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function FT(t){return(e,n)=>{let r=!1;for(const s of ia(t)){const i=XN(s,e,n);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function XN(t,e,n){const r=t.field.isKeyField()?G.comparator(e.key,n.key):function(i,o,l){const u=o.data.field(i),c=l.data.field(i);return u!==null&&c!==null?zi(u,c):Y(42886)}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return Y(19790,{direction:t.dir})}}/**
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
 */class Ys{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,n]);s.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[n]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){ns(this.inner,(n,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return TT(this.inner)}size(){return this.innerSize}}/**
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
 */const JN=new ke(G.comparator);function rr(){return JN}const UT=new ke(G.comparator);function Wo(...t){let e=UT;for(const n of t)e=e.insert(n.key,n);return e}function BT(t){let e=UT;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Es(){return oa()}function $T(){return oa()}function oa(){return new Ys(t=>t.toString(),(t,e)=>t.isEqual(e))}const ZN=new ke(G.comparator),eR=new We(G.comparator);function ie(...t){let e=eR;for(const n of t)e=e.add(n);return e}const tR=new We(ne);function nR(){return tR}/**
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
 */function um(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Yu(e)?"-0":e}}function zT(t){return{integerValue:""+t}}function rR(t,e){return NN(e)?zT(e):um(t,e)}/**
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
 */class Gc{constructor(){this._=void 0}}function sR(t,e,n){return t instanceof ja?function(s,i){const o={fields:{[ST]:{stringValue:IT},[kT]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&sm(i)&&(i=Wc(i)),i&&(o.fields[AT]=i),{mapValue:o}}(n,e):t instanceof La?HT(t,e):t instanceof Va?qT(t,e):function(s,i){const o=WT(s,i),l=Zv(o)+Zv(s.Ee);return jf(o)&&jf(s.Ee)?zT(l):um(s.serializer,l)}(t,e)}function iR(t,e,n){return t instanceof La?HT(t,e):t instanceof Va?qT(t,e):n}function WT(t,e){return t instanceof tc?function(r){return jf(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class ja extends Gc{}class La extends Gc{constructor(e){super(),this.elements=e}}function HT(t,e){const n=GT(e);for(const r of t.elements)n.some(s=>Mn(s,r))||n.push(r);return{arrayValue:{values:n}}}class Va extends Gc{constructor(e){super(),this.elements=e}}function qT(t,e){let n=GT(e);for(const r of t.elements)n=n.filter(s=>!Mn(s,r));return{arrayValue:{values:n}}}class tc extends Gc{constructor(e,n){super(),this.serializer=e,this.Ee=n}}function Zv(t){return De(t.integerValue||t.doubleValue)}function GT(t){return im(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
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
 */class oR{constructor(e,n){this.field=e,this.transform=n}}function aR(t,e){return t.field.isEqual(e.field)&&function(r,s){return r instanceof La&&s instanceof La||r instanceof Va&&s instanceof Va?$i(r.elements,s.elements,Mn):r instanceof tc&&s instanceof tc?Mn(r.Ee,s.Ee):r instanceof ja&&s instanceof ja}(t.transform,e.transform)}class lR{constructor(e,n){this.version=e,this.transformResults=n}}class Cn{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new Cn}static exists(e){return new Cn(void 0,e)}static updateTime(e){return new Cn(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function pu(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class Kc{}function KT(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new YT(t.key,Cn.none()):new Ja(t.key,t.data,Cn.none());{const n=t.data,r=Nt.empty();let s=new We(Je.comparator);for(let i of e.fields)if(!s.has(i)){let o=n.field(i);o===null&&i.length>1&&(i=i.popLast(),o=n.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new rs(t.key,r,new Ft(s.toArray()),Cn.none())}}function uR(t,e,n){t instanceof Ja?function(s,i,o){const l=s.value.clone(),u=t_(s.fieldTransforms,i,o.transformResults);l.setAll(u),i.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(t,e,n):t instanceof rs?function(s,i,o){if(!pu(s.precondition,i))return void i.convertToUnknownDocument(o.version);const l=t_(s.fieldTransforms,i,o.transformResults),u=i.data;u.setAll(QT(s)),u.setAll(l),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(t,e,n):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,n)}function aa(t,e,n,r){return t instanceof Ja?function(i,o,l,u){if(!pu(i.precondition,o))return l;const c=i.value.clone(),f=n_(i.fieldTransforms,u,o);return c.setAll(f),o.convertToFoundDocument(o.version,c).setHasLocalMutations(),null}(t,e,n,r):t instanceof rs?function(i,o,l,u){if(!pu(i.precondition,o))return l;const c=n_(i.fieldTransforms,u,o),f=o.data;return f.setAll(QT(i)),f.setAll(c),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),l===null?null:l.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(t,e,n,r):function(i,o,l){return pu(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):l}(t,e,n)}function cR(t,e){let n=null;for(const r of t.fieldTransforms){const s=e.data.field(r.field),i=WT(r.transform,s||null);i!=null&&(n===null&&(n=Nt.empty()),n.set(r.field,i))}return n||null}function e_(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&$i(r,s,(i,o)=>aR(i,o))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class Ja extends Kc{constructor(e,n,r,s=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class rs extends Kc{constructor(e,n,r,s,i=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function QT(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function t_(t,e,n){const r=new Map;de(t.length===n.length,32656,{Ae:n.length,Re:t.length});for(let s=0;s<n.length;s++){const i=t[s],o=i.transform,l=e.data.field(i.field);r.set(i.field,iR(o,l,n[s]))}return r}function n_(t,e,n){const r=new Map;for(const s of t){const i=s.transform,o=n.data.field(s.field);r.set(s.field,sR(i,o,e))}return r}class YT extends Kc{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class dR extends Kc{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class hR{constructor(e,n,r,s){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&uR(i,e,r[s])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=aa(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=aa(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=$T();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let l=this.applyToLocalView(o,i.mutatedFields);l=n.has(s.key)?null:l;const u=KT(o,l);u!==null&&r.set(s.key,u),o.isValidDocument()||o.convertToNoDocument(X.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),ie())}isEqual(e){return this.batchId===e.batchId&&$i(this.mutations,e.mutations,(n,r)=>e_(n,r))&&$i(this.baseMutations,e.baseMutations,(n,r)=>e_(n,r))}}class cm{constructor(e,n,r,s){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=s}static from(e,n,r){de(e.mutations.length===r.length,58842,{Ve:e.mutations.length,me:r.length});let s=function(){return ZN}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new cm(e,n,r,s)}}/**
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
 */class fR{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class pR{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
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
 */var Me,ae;function mR(t){switch(t){case L.OK:return Y(64938);case L.CANCELLED:case L.UNKNOWN:case L.DEADLINE_EXCEEDED:case L.RESOURCE_EXHAUSTED:case L.INTERNAL:case L.UNAVAILABLE:case L.UNAUTHENTICATED:return!1;case L.INVALID_ARGUMENT:case L.NOT_FOUND:case L.ALREADY_EXISTS:case L.PERMISSION_DENIED:case L.FAILED_PRECONDITION:case L.ABORTED:case L.OUT_OF_RANGE:case L.UNIMPLEMENTED:case L.DATA_LOSS:return!0;default:return Y(15467,{code:t})}}function XT(t){if(t===void 0)return nr("GRPC error has no .code"),L.UNKNOWN;switch(t){case Me.OK:return L.OK;case Me.CANCELLED:return L.CANCELLED;case Me.UNKNOWN:return L.UNKNOWN;case Me.DEADLINE_EXCEEDED:return L.DEADLINE_EXCEEDED;case Me.RESOURCE_EXHAUSTED:return L.RESOURCE_EXHAUSTED;case Me.INTERNAL:return L.INTERNAL;case Me.UNAVAILABLE:return L.UNAVAILABLE;case Me.UNAUTHENTICATED:return L.UNAUTHENTICATED;case Me.INVALID_ARGUMENT:return L.INVALID_ARGUMENT;case Me.NOT_FOUND:return L.NOT_FOUND;case Me.ALREADY_EXISTS:return L.ALREADY_EXISTS;case Me.PERMISSION_DENIED:return L.PERMISSION_DENIED;case Me.FAILED_PRECONDITION:return L.FAILED_PRECONDITION;case Me.ABORTED:return L.ABORTED;case Me.OUT_OF_RANGE:return L.OUT_OF_RANGE;case Me.UNIMPLEMENTED:return L.UNIMPLEMENTED;case Me.DATA_LOSS:return L.DATA_LOSS;default:return Y(39323,{code:t})}}(ae=Me||(Me={}))[ae.OK=0]="OK",ae[ae.CANCELLED=1]="CANCELLED",ae[ae.UNKNOWN=2]="UNKNOWN",ae[ae.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ae[ae.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ae[ae.NOT_FOUND=5]="NOT_FOUND",ae[ae.ALREADY_EXISTS=6]="ALREADY_EXISTS",ae[ae.PERMISSION_DENIED=7]="PERMISSION_DENIED",ae[ae.UNAUTHENTICATED=16]="UNAUTHENTICATED",ae[ae.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ae[ae.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ae[ae.ABORTED=10]="ABORTED",ae[ae.OUT_OF_RANGE=11]="OUT_OF_RANGE",ae[ae.UNIMPLEMENTED=12]="UNIMPLEMENTED",ae[ae.INTERNAL=13]="INTERNAL",ae[ae.UNAVAILABLE=14]="UNAVAILABLE",ae[ae.DATA_LOSS=15]="DATA_LOSS";/**
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
 */const gR=new Fr([4294967295,4294967295],0);function r_(t){const e=vT().encode(t),n=new cT;return n.update(e),new Uint8Array(n.digest())}function s_(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Fr([n,r],0),new Fr([s,i],0)]}class dm{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new Ho(`Invalid padding: ${n}`);if(r<0)throw new Ho(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Ho(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new Ho(`Invalid padding when bitmap length is 0: ${n}`);this.fe=8*e.length-n,this.ge=Fr.fromNumber(this.fe)}pe(e,n,r){let s=e.add(n.multiply(Fr.fromNumber(r)));return s.compare(gR)===1&&(s=new Fr([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ge).toNumber()}ye(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.fe===0)return!1;const n=r_(e),[r,s]=s_(n);for(let i=0;i<this.hashCount;i++){const o=this.pe(r,s,i);if(!this.ye(o))return!1}return!0}static create(e,n,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new dm(i,s,n);return r.forEach(l=>o.insert(l)),o}insert(e){if(this.fe===0)return;const n=r_(e),[r,s]=s_(n);for(let i=0;i<this.hashCount;i++){const o=this.pe(r,s,i);this.we(o)}}we(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class Ho extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Qc{constructor(e,n,r,s,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const s=new Map;return s.set(e,Za.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new Qc(X.min(),s,new ke(ne),rr(),ie())}}class Za{constructor(e,n,r,s,i){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new Za(r,n,ie(),ie(),ie())}}/**
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
 */class mu{constructor(e,n,r,s){this.Se=e,this.removedTargetIds=n,this.key=r,this.be=s}}class JT{constructor(e,n){this.targetId=e,this.De=n}}class ZT{constructor(e,n,r=tt.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=s}}class i_{constructor(){this.ve=0,this.Ce=o_(),this.Fe=tt.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return this.ve!==0}get Ne(){return this.xe}Be(e){e.approximateByteSize()>0&&(this.xe=!0,this.Fe=e)}Le(){let e=ie(),n=ie(),r=ie();return this.Ce.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:n=n.add(s);break;case 1:r=r.add(s);break;default:Y(38017,{changeType:i})}}),new Za(this.Fe,this.Me,e,n,r)}ke(){this.xe=!1,this.Ce=o_()}qe(e,n){this.xe=!0,this.Ce=this.Ce.insert(e,n)}Qe(e){this.xe=!0,this.Ce=this.Ce.remove(e)}$e(){this.ve+=1}Ue(){this.ve-=1,de(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class yR{constructor(e){this.We=e,this.Ge=new Map,this.ze=rr(),this.je=ql(),this.Je=ql(),this.He=new ke(ne)}Ye(e){for(const n of e.Se)e.be&&e.be.isFoundDocument()?this.Ze(n,e.be):this.Xe(n,e.key,e.be);for(const n of e.removedTargetIds)this.Xe(n,e.key,e.be)}et(e){this.forEachTarget(e,n=>{const r=this.tt(n);switch(e.state){case 0:this.nt(n)&&r.Be(e.resumeToken);break;case 1:r.Ue(),r.Oe||r.ke(),r.Be(e.resumeToken);break;case 2:r.Ue(),r.Oe||this.removeTarget(n);break;case 3:this.nt(n)&&(r.Ke(),r.Be(e.resumeToken));break;case 4:this.nt(n)&&(this.rt(n),r.Be(e.resumeToken));break;default:Y(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Ge.forEach((r,s)=>{this.nt(s)&&n(s)})}it(e){const n=e.targetId,r=e.De.count,s=this.st(n);if(s){const i=s.target;if(Vf(i))if(r===0){const o=new G(i.path);this.Xe(n,o,dt.newNoDocument(o,X.min()))}else de(r===1,20013,{expectedCount:r});else{const o=this.ot(n);if(o!==r){const l=this._t(e),u=l?this.ut(l,e,o):1;if(u!==0){this.rt(n);const c=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(n,c)}}}}}_t(e){const n=e.De.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=n;let o,l;try{o=Gr(r).toUint8Array()}catch(u){if(u instanceof xT)return Wr("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{l=new dm(o,s,i)}catch(u){return Wr(u instanceof Ho?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return l.fe===0?null:l}ut(e,n,r){return n.De.count===r-this.ht(e,n.targetId)?0:2}ht(e,n){const r=this.We.getRemoteKeysForTarget(n);let s=0;return r.forEach(i=>{const o=this.We.lt(),l=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(l)||(this.Xe(n,i,null),s++)}),s}Pt(e){const n=new Map;this.Ge.forEach((i,o)=>{const l=this.st(o);if(l){if(i.current&&Vf(l.target)){const u=new G(l.target.path);this.Tt(u).has(o)||this.It(o,u)||this.Xe(o,u,dt.newNoDocument(u,e))}i.Ne&&(n.set(o,i.Le()),i.ke())}});let r=ie();this.Je.forEach((i,o)=>{let l=!0;o.forEachWhile(u=>{const c=this.st(u);return!c||c.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(i))}),this.ze.forEach((i,o)=>o.setReadTime(e));const s=new Qc(e,n,this.He,this.ze,r);return this.ze=rr(),this.je=ql(),this.Je=ql(),this.He=new ke(ne),s}Ze(e,n){if(!this.nt(e))return;const r=this.It(e,n.key)?2:0;this.tt(e).qe(n.key,r),this.ze=this.ze.insert(n.key,n),this.je=this.je.insert(n.key,this.Tt(n.key).add(e)),this.Je=this.Je.insert(n.key,this.dt(n.key).add(e))}Xe(e,n,r){if(!this.nt(e))return;const s=this.tt(e);this.It(e,n)?s.qe(n,1):s.Qe(n),this.Je=this.Je.insert(n,this.dt(n).delete(e)),this.Je=this.Je.insert(n,this.dt(n).add(e)),r&&(this.ze=this.ze.insert(n,r))}removeTarget(e){this.Ge.delete(e)}ot(e){const n=this.tt(e).Le();return this.We.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.tt(e).$e()}tt(e){let n=this.Ge.get(e);return n||(n=new i_,this.Ge.set(e,n)),n}dt(e){let n=this.Je.get(e);return n||(n=new We(ne),this.Je=this.Je.insert(e,n)),n}Tt(e){let n=this.je.get(e);return n||(n=new We(ne),this.je=this.je.insert(e,n)),n}nt(e){const n=this.st(e)!==null;return n||H("WatchChangeAggregator","Detected inactive target",e),n}st(e){const n=this.Ge.get(e);return n&&n.Oe?null:this.We.Et(e)}rt(e){this.Ge.set(e,new i_),this.We.getRemoteKeysForTarget(e).forEach(n=>{this.Xe(e,n,null)})}It(e,n){return this.We.getRemoteKeysForTarget(e).has(n)}}function ql(){return new ke(G.comparator)}function o_(){return new ke(G.comparator)}const vR={asc:"ASCENDING",desc:"DESCENDING"},_R={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},wR={and:"AND",or:"OR"};class ER{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function Uf(t,e){return t.useProto3Json||zc(e)?e:{value:e}}function nc(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function ex(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function TR(t,e){return nc(t,e.toTimestamp())}function Nn(t){return de(!!t,49232),X.fromTimestamp(function(n){const r=qr(n);return new we(r.seconds,r.nanos)}(t))}function hm(t,e){return Bf(t,e).canonicalString()}function Bf(t,e){const n=function(s){return new ge(["projects",s.projectId,"databases",s.database])}(t).child("documents");return e===void 0?n:n.child(e)}function tx(t){const e=ge.fromString(t);return de(ox(e),10190,{key:e.toString()}),e}function $f(t,e){return hm(t.databaseId,e.path)}function mh(t,e){const n=tx(e);if(n.get(1)!==t.databaseId.projectId)throw new W(L.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new W(L.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new G(rx(n))}function nx(t,e){return hm(t.databaseId,e)}function xR(t){const e=tx(t);return e.length===4?ge.emptyPath():rx(e)}function zf(t){return new ge(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function rx(t){return de(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function a_(t,e,n){return{name:$f(t,e),fields:n.value.mapValue.fields}}function IR(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:Y(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(c,f){return c.useProto3Json?(de(f===void 0||typeof f=="string",58123),tt.fromBase64String(f||"")):(de(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),tt.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,l=o&&function(c){const f=c.code===void 0?L.UNKNOWN:XT(c.code);return new W(f,c.message||"")}(o);n=new ZT(r,s,i,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=mh(t,r.document.name),i=Nn(r.document.updateTime),o=r.document.createTime?Nn(r.document.createTime):X.min(),l=new Nt({mapValue:{fields:r.document.fields}}),u=dt.newFoundDocument(s,i,o,l),c=r.targetIds||[],f=r.removedTargetIds||[];n=new mu(c,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=mh(t,r.document),i=r.readTime?Nn(r.readTime):X.min(),o=dt.newNoDocument(s,i),l=r.removedTargetIds||[];n=new mu([],l,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=mh(t,r.document),i=r.removedTargetIds||[];n=new mu([],i,s,null)}else{if(!("filter"in e))return Y(11601,{At:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new pR(s,i),l=r.targetId;n=new JT(l,o)}}return n}function SR(t,e){let n;if(e instanceof Ja)n={update:a_(t,e.key,e.value)};else if(e instanceof YT)n={delete:$f(t,e.key)};else if(e instanceof rs)n={update:a_(t,e.key,e.data),updateMask:OR(e.fieldMask)};else{if(!(e instanceof dR))return Y(16599,{Rt:e.type});n={verify:$f(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const l=o.transform;if(l instanceof ja)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof La)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof Va)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof tc)return{fieldPath:o.field.canonicalString(),increment:l.Ee};throw Y(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(n.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:TR(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:Y(27497)}(t,e.precondition)),n}function AR(t,e){return t&&t.length>0?(de(e!==void 0,14353),t.map(n=>function(s,i){let o=s.updateTime?Nn(s.updateTime):Nn(i);return o.isEqual(X.min())&&(o=Nn(i)),new lR(o,s.transformResults||[])}(n,e))):[]}function kR(t,e){return{documents:[nx(t,e.path)]}}function bR(t,e){const n={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=nx(t,s);const i=function(c){if(c.length!==0)return ix(yn.create(c,"and"))}(e.filters);i&&(n.structuredQuery.where=i);const o=function(c){if(c.length!==0)return c.map(f=>function(g){return{field:ui(g.field),direction:RR(g.dir)}}(f))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const l=Uf(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{Vt:n,parent:s}}function CR(t){let e=xR(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){de(r===1,65062);const f=n.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];n.where&&(i=function(m){const g=sx(m);return g instanceof yn&&DT(g)?g.getFilters():[g]}(n.where));let o=[];n.orderBy&&(o=function(m){return m.map(g=>function(A){return new Ma(ci(A.field),function(N){switch(N){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(A.direction))}(g))}(n.orderBy));let l=null;n.limit&&(l=function(m){let g;return g=typeof m=="object"?m.value:m,zc(g)?null:g}(n.limit));let u=null;n.startAt&&(u=function(m){const g=!!m.before,x=m.values||[];return new Zu(x,g)}(n.startAt));let c=null;return n.endAt&&(c=function(m){const g=!m.before,x=m.values||[];return new Zu(x,g)}(n.endAt)),KN(e,s,o,i,l,"F",u,c)}function NR(t,e){const n=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Y(28987,{purpose:s})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function sx(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=ci(n.unaryFilter.field);return Ve.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=ci(n.unaryFilter.field);return Ve.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=ci(n.unaryFilter.field);return Ve.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=ci(n.unaryFilter.field);return Ve.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Y(61313);default:return Y(60726)}}(t):t.fieldFilter!==void 0?function(n){return Ve.create(ci(n.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Y(58110);default:return Y(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return yn.create(n.compositeFilter.filters.map(r=>sx(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return Y(1026)}}(n.compositeFilter.op))}(t):Y(30097,{filter:t})}function RR(t){return vR[t]}function PR(t){return _R[t]}function DR(t){return wR[t]}function ui(t){return{fieldPath:t.canonicalString()}}function ci(t){return Je.fromServerFormat(t.fieldPath)}function ix(t){return t instanceof Ve?function(n){if(n.op==="=="){if(Kv(n.value))return{unaryFilter:{field:ui(n.field),op:"IS_NAN"}};if(Gv(n.value))return{unaryFilter:{field:ui(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(Kv(n.value))return{unaryFilter:{field:ui(n.field),op:"IS_NOT_NAN"}};if(Gv(n.value))return{unaryFilter:{field:ui(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:ui(n.field),op:PR(n.op),value:n.value}}}(t):t instanceof yn?function(n){const r=n.getFilters().map(s=>ix(s));return r.length===1?r[0]:{compositeFilter:{op:DR(n.op),filters:r}}}(t):Y(54877,{filter:t})}function OR(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function ox(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
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
 */class br{constructor(e,n,r,s,i=X.min(),o=X.min(),l=tt.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=l,this.expectedCount=u}withSequenceNumber(e){return new br(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new br(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new br(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new br(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class MR{constructor(e){this.gt=e}}function jR(t){const e=CR({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?ec(e,e.limit,"L"):e}/**
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
 */class LR{constructor(){this.Dn=new VR}addToCollectionParentIndex(e,n){return this.Dn.add(n),F.resolve()}getCollectionParents(e,n){return F.resolve(this.Dn.getEntries(n))}addFieldIndex(e,n){return F.resolve()}deleteFieldIndex(e,n){return F.resolve()}deleteAllFieldIndexes(e){return F.resolve()}createTargetIndexes(e,n){return F.resolve()}getDocumentsMatchingTarget(e,n){return F.resolve(null)}getIndexType(e,n){return F.resolve(0)}getFieldIndexes(e,n){return F.resolve([])}getNextCollectionGroupToUpdate(e){return F.resolve(null)}getMinOffset(e,n){return F.resolve(Hr.min())}getMinOffsetFromCollectionGroup(e,n){return F.resolve(Hr.min())}updateCollectionGroup(e,n,r){return F.resolve()}updateIndexEntries(e,n){return F.resolve()}}class VR{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n]||new We(ge.comparator),i=!s.has(r);return this.index[n]=s.add(r),i}has(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n];return s&&s.has(r)}getEntries(e){return(this.index[e]||new We(ge.comparator)).toArray()}}/**
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
 */const l_={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},ax=41943040;class kt{static withCacheSize(e){return new kt(e,kt.DEFAULT_COLLECTION_PERCENTILE,kt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=r}}/**
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
 */kt.DEFAULT_COLLECTION_PERCENTILE=10,kt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,kt.DEFAULT=new kt(ax,kt.DEFAULT_COLLECTION_PERCENTILE,kt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),kt.DISABLED=new kt(-1,0,0);/**
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
 */class Hi{constructor(e){this._r=e}next(){return this._r+=2,this._r}static ar(){return new Hi(0)}static ur(){return new Hi(-1)}}/**
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
 */const u_="LruGarbageCollector",FR=1048576;function c_([t,e],[n,r]){const s=ne(t,n);return s===0?ne(e,r):s}class UR{constructor(e){this.Tr=e,this.buffer=new We(c_),this.Ir=0}dr(){return++this.Ir}Er(e){const n=[e,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(n);else{const r=this.buffer.last();c_(n,r)<0&&(this.buffer=this.buffer.delete(r).add(n))}}get maxValue(){return this.buffer.last()[0]}}class BR{constructor(e,n,r){this.garbageCollector=e,this.asyncQueue=n,this.localStore=r,this.Ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return this.Ar!==null}Rr(e){H(u_,`Garbage collection scheduled in ${e}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){so(n)?H(u_,"Ignoring IndexedDB error during garbage collection: ",n):await ro(n)}await this.Rr(3e5)})}}class $R{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.mr(e).next(r=>Math.floor(n/100*r))}nthSequenceNumber(e,n){if(n===0)return F.resolve($c.ue);const r=new UR(n);return this.Vr.forEachTarget(e,s=>r.Er(s.sequenceNumber)).next(()=>this.Vr.gr(e,s=>r.Er(s))).next(()=>r.maxValue)}removeTargets(e,n,r){return this.Vr.removeTargets(e,n,r)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?(H("LruGarbageCollector","Garbage collection skipped; disabled"),F.resolve(l_)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(H("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),l_):this.pr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}pr(e,n){let r,s,i,o,l,u,c;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?(H("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),s=this.params.maximumSequenceNumbersToCollect):s=m,o=Date.now(),this.nthSequenceNumber(e,s))).next(m=>(r=m,l=Date.now(),this.removeTargets(e,r,n))).next(m=>(i=m,u=Date.now(),this.removeOrphanedDocuments(e,r))).next(m=>(c=Date.now(),ai()<=se.DEBUG&&H("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${s} in `+(l-o)+`ms
	Removed ${i} targets in `+(u-l)+`ms
	Removed ${m} documents in `+(c-u)+`ms
Total Duration: ${c-f}ms`),F.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:m})))}}function zR(t,e){return new $R(t,e)}/**
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
 */class WR{constructor(){this.changes=new Ys(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,dt.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?F.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class HR{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
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
 */class qR{constructor(e,n,r,s){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,n))).next(s=>(r!==null&&aa(r.mutation,s,Ft.empty(),we.now()),s))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,ie()).next(()=>r))}getLocalViewOfDocuments(e,n,r=ie()){const s=Es();return this.populateOverlays(e,s,n).next(()=>this.computeViews(e,n,s,r).next(i=>{let o=Wo();return i.forEach((l,u)=>{o=o.insert(l,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const r=Es();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,ie()))}populateOverlays(e,n,r){const s=[];return r.forEach(i=>{n.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,l)=>{n.set(o,l)})})}computeViews(e,n,r,s){let i=rr();const o=oa(),l=function(){return oa()}();return n.forEach((u,c)=>{const f=r.get(c.key);s.has(c.key)&&(f===void 0||f.mutation instanceof rs)?i=i.insert(c.key,c):f!==void 0?(o.set(c.key,f.mutation.getFieldMask()),aa(f.mutation,c,f.mutation.getFieldMask(),we.now())):o.set(c.key,Ft.empty())}),this.recalculateAndSaveOverlays(e,i).next(u=>(u.forEach((c,f)=>o.set(c,f)),n.forEach((c,f)=>{var m;return l.set(c,new HR(f,(m=o.get(c))!==null&&m!==void 0?m:null))}),l))}recalculateAndSaveOverlays(e,n){const r=oa();let s=new ke((o,l)=>o-l),i=ie();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const l of o)l.keys().forEach(u=>{const c=n.get(u);if(c===null)return;let f=r.get(u)||Ft.empty();f=l.applyToLocalView(c,f),r.set(u,f);const m=(s.get(l.batchId)||ie()).add(u);s=s.insert(l.batchId,m)})}).next(()=>{const o=[],l=s.getReverseIterator();for(;l.hasNext();){const u=l.getNext(),c=u.key,f=u.value,m=$T();f.forEach(g=>{if(!i.has(g)){const x=KT(n.get(g),r.get(g));x!==null&&m.set(g,x),i=i.add(g)}}),o.push(this.documentOverlayCache.saveOverlays(e,c,m))}return F.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,s){return function(o){return G.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):LT(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,s):this.getDocumentsMatchingCollectionQuery(e,n,r,s)}getNextDocuments(e,n,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,s-i.size):F.resolve(Es());let l=Ra,u=i;return o.next(c=>F.forEach(c,(f,m)=>(l<m.largestBatchId&&(l=m.largestBatchId),i.get(f)?F.resolve():this.remoteDocumentCache.getEntry(e,f).next(g=>{u=u.insert(f,g)}))).next(()=>this.populateOverlays(e,c,i)).next(()=>this.computeViews(e,u,c,ie())).next(f=>({batchId:l,changes:BT(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new G(n)).next(r=>{let s=Wo();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,n,r,s){const i=n.collectionGroup;let o=Wo();return this.indexManager.getCollectionParents(e,i).next(l=>F.forEach(l,u=>{const c=function(m,g){return new io(g,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(n,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,c,r,s).next(f=>{f.forEach((m,g)=>{o=o.insert(m,g)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,n,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,i,s))).next(o=>{i.forEach((u,c)=>{const f=c.getKey();o.get(f)===null&&(o=o.insert(f,dt.newInvalidDocument(f)))});let l=Wo();return o.forEach((u,c)=>{const f=i.get(u);f!==void 0&&aa(f.mutation,c,Ft.empty(),we.now()),qc(n,c)&&(l=l.insert(u,c))}),l})}}/**
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
 */class GR{constructor(e){this.serializer=e,this.Br=new Map,this.Lr=new Map}getBundleMetadata(e,n){return F.resolve(this.Br.get(n))}saveBundleMetadata(e,n){return this.Br.set(n.id,function(s){return{id:s.id,version:s.version,createTime:Nn(s.createTime)}}(n)),F.resolve()}getNamedQuery(e,n){return F.resolve(this.Lr.get(n))}saveNamedQuery(e,n){return this.Lr.set(n.name,function(s){return{name:s.name,query:jR(s.bundledQuery),readTime:Nn(s.readTime)}}(n)),F.resolve()}}/**
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
 */class KR{constructor(){this.overlays=new ke(G.comparator),this.kr=new Map}getOverlay(e,n){return F.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Es();return F.forEach(n,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((s,i)=>{this.wt(e,n,i)}),F.resolve()}removeOverlaysForBatchId(e,n,r){const s=this.kr.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.kr.delete(r)),F.resolve()}getOverlaysForCollection(e,n,r){const s=Es(),i=n.length+1,o=new G(n.child("")),l=this.overlays.getIteratorFrom(o);for(;l.hasNext();){const u=l.getNext().value,c=u.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===i&&u.largestBatchId>r&&s.set(u.getKey(),u)}return F.resolve(s)}getOverlaysForCollectionGroup(e,n,r,s){let i=new ke((c,f)=>c-f);const o=this.overlays.getIterator();for(;o.hasNext();){const c=o.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>r){let f=i.get(c.largestBatchId);f===null&&(f=Es(),i=i.insert(c.largestBatchId,f)),f.set(c.getKey(),c)}}const l=Es(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((c,f)=>l.set(c,f)),!(l.size()>=s)););return F.resolve(l)}wt(e,n,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.kr.get(s.largestBatchId).delete(r.key);this.kr.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new fR(n,r));let i=this.kr.get(n);i===void 0&&(i=ie(),this.kr.set(n,i)),this.kr.set(n,i.add(r.key))}}/**
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
 */class QR{constructor(){this.sessionToken=tt.EMPTY_BYTE_STRING}getSessionToken(e){return F.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,F.resolve()}}/**
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
 */class fm{constructor(){this.qr=new We(qe.Qr),this.$r=new We(qe.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(e,n){const r=new qe(e,n);this.qr=this.qr.add(r),this.$r=this.$r.add(r)}Kr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Wr(new qe(e,n))}Gr(e,n){e.forEach(r=>this.removeReference(r,n))}zr(e){const n=new G(new ge([])),r=new qe(n,e),s=new qe(n,e+1),i=[];return this.$r.forEachInRange([r,s],o=>{this.Wr(o),i.push(o.key)}),i}jr(){this.qr.forEach(e=>this.Wr(e))}Wr(e){this.qr=this.qr.delete(e),this.$r=this.$r.delete(e)}Jr(e){const n=new G(new ge([])),r=new qe(n,e),s=new qe(n,e+1);let i=ie();return this.$r.forEachInRange([r,s],o=>{i=i.add(o.key)}),i}containsKey(e){const n=new qe(e,0),r=this.qr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class qe{constructor(e,n){this.key=e,this.Hr=n}static Qr(e,n){return G.comparator(e.key,n.key)||ne(e.Hr,n.Hr)}static Ur(e,n){return ne(e.Hr,n.Hr)||G.comparator(e.key,n.key)}}/**
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
 */class YR{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.er=1,this.Yr=new We(qe.Qr)}checkEmpty(e){return F.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,s){const i=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new hR(i,n,r,s);this.mutationQueue.push(o);for(const l of s)this.Yr=this.Yr.add(new qe(l.key,i)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return F.resolve(o)}lookupMutationBatch(e,n){return F.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,s=this.Xr(r),i=s<0?0:s;return F.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return F.resolve(this.mutationQueue.length===0?rm:this.er-1)}getAllMutationBatches(e){return F.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new qe(n,0),s=new qe(n,Number.POSITIVE_INFINITY),i=[];return this.Yr.forEachInRange([r,s],o=>{const l=this.Zr(o.Hr);i.push(l)}),F.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new We(ne);return n.forEach(s=>{const i=new qe(s,0),o=new qe(s,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([i,o],l=>{r=r.add(l.Hr)})}),F.resolve(this.ei(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,s=r.length+1;let i=r;G.isDocumentKey(i)||(i=i.child(""));const o=new qe(new G(i),0);let l=new We(ne);return this.Yr.forEachWhile(u=>{const c=u.key.path;return!!r.isPrefixOf(c)&&(c.length===s&&(l=l.add(u.Hr)),!0)},o),F.resolve(this.ei(l))}ei(e){const n=[];return e.forEach(r=>{const s=this.Zr(r);s!==null&&n.push(s)}),n}removeMutationBatch(e,n){de(this.ti(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Yr;return F.forEach(n.mutations,s=>{const i=new qe(s.key,n.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.Yr=r})}rr(e){}containsKey(e,n){const r=new qe(n,0),s=this.Yr.firstAfterOrEqual(r);return F.resolve(n.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,F.resolve()}ti(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
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
 */class XR{constructor(e){this.ni=e,this.docs=function(){return new ke(G.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,s=this.docs.get(r),i=s?s.size:0,o=this.ni(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return F.resolve(r?r.document.mutableCopy():dt.newInvalidDocument(n))}getEntries(e,n){let r=rr();return n.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():dt.newInvalidDocument(s))}),F.resolve(r)}getDocumentsMatchingQuery(e,n,r,s){let i=rr();const o=n.path,l=new G(o.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(l);for(;u.hasNext();){const{key:c,value:{document:f}}=u.getNext();if(!o.isPrefixOf(c.path))break;c.path.length>o.length+1||AN(SN(f),r)<=0||(s.has(f.key)||qc(n,f))&&(i=i.insert(f.key,f.mutableCopy()))}return F.resolve(i)}getAllFromCollectionGroup(e,n,r,s){Y(9500)}ri(e,n){return F.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new JR(this)}getSize(e){return F.resolve(this.size)}}class JR extends WR{constructor(e){super(),this.Or=e}applyChanges(e){const n=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?n.push(this.Or.addEntry(e,s)):this.Or.removeEntry(r)}),F.waitFor(n)}getFromCache(e,n){return this.Or.getEntry(e,n)}getAllFromCache(e,n){return this.Or.getEntries(e,n)}}/**
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
 */class ZR{constructor(e){this.persistence=e,this.ii=new Ys(n=>om(n),am),this.lastRemoteSnapshotVersion=X.min(),this.highestTargetId=0,this.si=0,this.oi=new fm,this.targetCount=0,this._i=Hi.ar()}forEachTarget(e,n){return this.ii.forEach((r,s)=>n(s)),F.resolve()}getLastRemoteSnapshotVersion(e){return F.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return F.resolve(this.si)}allocateTargetId(e){return this.highestTargetId=this._i.next(),F.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.si&&(this.si=n),F.resolve()}hr(e){this.ii.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this._i=new Hi(n),this.highestTargetId=n),e.sequenceNumber>this.si&&(this.si=e.sequenceNumber)}addTargetData(e,n){return this.hr(n),this.targetCount+=1,F.resolve()}updateTargetData(e,n){return this.hr(n),F.resolve()}removeTargetData(e,n){return this.ii.delete(n.target),this.oi.zr(n.targetId),this.targetCount-=1,F.resolve()}removeTargets(e,n,r){let s=0;const i=[];return this.ii.forEach((o,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.ii.delete(o),i.push(this.removeMatchingKeysForTargetId(e,l.targetId)),s++)}),F.waitFor(i).next(()=>s)}getTargetCount(e){return F.resolve(this.targetCount)}getTargetData(e,n){const r=this.ii.get(n)||null;return F.resolve(r)}addMatchingKeys(e,n,r){return this.oi.Kr(n,r),F.resolve()}removeMatchingKeys(e,n,r){this.oi.Gr(n,r);const s=this.persistence.referenceDelegate,i=[];return s&&n.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),F.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.oi.zr(n),F.resolve()}getMatchingKeysForTargetId(e,n){const r=this.oi.Jr(n);return F.resolve(r)}containsKey(e,n){return F.resolve(this.oi.containsKey(n))}}/**
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
 */class lx{constructor(e,n){this.ai={},this.overlays={},this.ui=new $c(0),this.ci=!1,this.ci=!0,this.li=new QR,this.referenceDelegate=e(this),this.hi=new ZR(this),this.indexManager=new LR,this.remoteDocumentCache=function(s){return new XR(s)}(r=>this.referenceDelegate.Pi(r)),this.serializer=new MR(n),this.Ti=new GR(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new KR,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.ai[e.toKey()];return r||(r=new YR(n,this.referenceDelegate),this.ai[e.toKey()]=r),r}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(e,n,r){H("MemoryPersistence","Starting transaction:",e);const s=new eP(this.ui.next());return this.referenceDelegate.Ii(),r(s).next(i=>this.referenceDelegate.di(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Ei(e,n){return F.or(Object.values(this.ai).map(r=>()=>r.containsKey(e,n)))}}class eP extends bN{constructor(e){super(),this.currentSequenceNumber=e}}class pm{constructor(e){this.persistence=e,this.Ai=new fm,this.Ri=null}static Vi(e){return new pm(e)}get mi(){if(this.Ri)return this.Ri;throw Y(60996)}addReference(e,n,r){return this.Ai.addReference(r,n),this.mi.delete(r.toString()),F.resolve()}removeReference(e,n,r){return this.Ai.removeReference(r,n),this.mi.add(r.toString()),F.resolve()}markPotentiallyOrphaned(e,n){return this.mi.add(n.toString()),F.resolve()}removeTarget(e,n){this.Ai.zr(n.targetId).forEach(s=>this.mi.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(s=>{s.forEach(i=>this.mi.add(i.toString()))}).next(()=>r.removeTargetData(e,n))}Ii(){this.Ri=new Set}di(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return F.forEach(this.mi,r=>{const s=G.fromPath(r);return this.fi(e,s).next(i=>{i||n.removeEntry(s,X.min())})}).next(()=>(this.Ri=null,n.apply(e)))}updateLimboDocument(e,n){return this.fi(e,n).next(r=>{r?this.mi.delete(n.toString()):this.mi.add(n.toString())})}Pi(e){return 0}fi(e,n){return F.or([()=>F.resolve(this.Ai.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}}class rc{constructor(e,n){this.persistence=e,this.gi=new Ys(r=>RN(r.path),(r,s)=>r.isEqual(s)),this.garbageCollector=zR(this,n)}static Vi(e,n){return new rc(e,n)}Ii(){}di(e){return F.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}mr(e){const n=this.yr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>n.next(s=>r+s))}yr(e){let n=0;return this.gr(e,r=>{n++}).next(()=>n)}gr(e,n){return F.forEach(this.gi,(r,s)=>this.Sr(e,r,s).next(i=>i?F.resolve():n(s)))}removeTargets(e,n,r){return this.persistence.getTargetCache().removeTargets(e,n,r)}removeOrphanedDocuments(e,n){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.ri(e,o=>this.Sr(e,o,n).next(l=>{l||(r++,i.removeEntry(o,X.min()))})).next(()=>i.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,n){return this.gi.set(n,e.currentSequenceNumber),F.resolve()}removeTarget(e,n){const r=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,n,r){return this.gi.set(r,e.currentSequenceNumber),F.resolve()}removeReference(e,n,r){return this.gi.set(r,e.currentSequenceNumber),F.resolve()}updateLimboDocument(e,n){return this.gi.set(n,e.currentSequenceNumber),F.resolve()}Pi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=hu(e.data.value)),n}Sr(e,n,r){return F.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{const s=this.gi.get(n);return F.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class mm{constructor(e,n,r,s){this.targetId=e,this.fromCache=n,this.Is=r,this.ds=s}static Es(e,n){let r=ie(),s=ie();for(const i of n.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new mm(e,n.fromCache,r,s)}}/**
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
 */class tP{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class nP{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=function(){return Kb()?8:CN(gt())>0?6:4}()}initialize(e,n){this.gs=e,this.indexManager=n,this.As=!0}getDocumentsMatchingQuery(e,n,r,s){const i={result:null};return this.ps(e,n).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.ys(e,n,s,r).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new tP;return this.ws(e,n,o).next(l=>{if(i.result=l,this.Rs)return this.Ss(e,n,o,l.size)})}).next(()=>i.result)}Ss(e,n,r,s){return r.documentReadCount<this.Vs?(ai()<=se.DEBUG&&H("QueryEngine","SDK will not create cache indexes for query:",li(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),F.resolve()):(ai()<=se.DEBUG&&H("QueryEngine","Query:",li(n),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.fs*s?(ai()<=se.DEBUG&&H("QueryEngine","The SDK decides to create cache indexes for query:",li(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,bn(n))):F.resolve())}ps(e,n){if(Jv(n))return F.resolve(null);let r=bn(n);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(n.limit!==null&&s===1&&(n=ec(n,null,"F"),r=bn(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const o=ie(...i);return this.gs.getDocuments(e,o).next(l=>this.indexManager.getMinOffset(e,r).next(u=>{const c=this.bs(n,l);return this.Ds(n,c,o,u.readTime)?this.ps(e,ec(n,null,"F")):this.vs(e,c,n,u)}))})))}ys(e,n,r,s){return Jv(n)||s.isEqual(X.min())?F.resolve(null):this.gs.getDocuments(e,r).next(i=>{const o=this.bs(n,i);return this.Ds(n,o,r,s)?F.resolve(null):(ai()<=se.DEBUG&&H("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),li(n)),this.vs(e,o,n,IN(s,Ra)).next(l=>l))})}bs(e,n){let r=new We(FT(e));return n.forEach((s,i)=>{qc(e,i)&&(r=r.add(i))}),r}Ds(e,n,r,s){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}ws(e,n,r){return ai()<=se.DEBUG&&H("QueryEngine","Using full collection scan to execute query:",li(n)),this.gs.getDocumentsMatchingQuery(e,n,Hr.min(),r)}vs(e,n,r,s){return this.gs.getDocumentsMatchingQuery(e,r,s).next(i=>(n.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
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
 */const gm="LocalStore",rP=3e8;class sP{constructor(e,n,r,s){this.persistence=e,this.Cs=n,this.serializer=s,this.Fs=new ke(ne),this.Ms=new Ys(i=>om(i),am),this.xs=new Map,this.Os=e.getRemoteDocumentCache(),this.hi=e.getTargetCache(),this.Ti=e.getBundleCache(),this.Ns(r)}Ns(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new qR(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.Fs))}}function iP(t,e,n,r){return new sP(t,e,n,r)}async function ux(t,e){const n=ee(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let s;return n.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,n.Ns(e),n.mutationQueue.getAllMutationBatches(r))).next(i=>{const o=[],l=[];let u=ie();for(const c of s){o.push(c.batchId);for(const f of c.mutations)u=u.add(f.key)}for(const c of i){l.push(c.batchId);for(const f of c.mutations)u=u.add(f.key)}return n.localDocuments.getDocuments(r,u).next(c=>({Bs:c,removedBatchIds:o,addedBatchIds:l}))})})}function oP(t,e){const n=ee(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=n.Os.newChangeBuffer({trackRemovals:!0});return function(l,u,c,f){const m=c.batch,g=m.keys();let x=F.resolve();return g.forEach(A=>{x=x.next(()=>f.getEntry(u,A)).next(C=>{const N=c.docVersions.get(A);de(N!==null,48541),C.version.compareTo(N)<0&&(m.applyToRemoteDocument(C,c),C.isValidDocument()&&(C.setReadTime(c.commitVersion),f.addEntry(C)))})}),x.next(()=>l.mutationQueue.removeMutationBatch(u,m))}(n,r,e,i).next(()=>i.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let u=ie();for(let c=0;c<l.mutationResults.length;++c)l.mutationResults[c].transformResults.length>0&&(u=u.add(l.batch.mutations[c].key));return u}(e))).next(()=>n.localDocuments.getDocuments(r,s))})}function cx(t){const e=ee(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.hi.getLastRemoteSnapshotVersion(n))}function aP(t,e){const n=ee(t),r=e.snapshotVersion;let s=n.Fs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=n.Os.newChangeBuffer({trackRemovals:!0});s=n.Fs;const l=[];e.targetChanges.forEach((f,m)=>{const g=s.get(m);if(!g)return;l.push(n.hi.removeMatchingKeys(i,f.removedDocuments,m).next(()=>n.hi.addMatchingKeys(i,f.addedDocuments,m)));let x=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?x=x.withResumeToken(tt.EMPTY_BYTE_STRING,X.min()).withLastLimboFreeSnapshotVersion(X.min()):f.resumeToken.approximateByteSize()>0&&(x=x.withResumeToken(f.resumeToken,r)),s=s.insert(m,x),function(C,N,E){return C.resumeToken.approximateByteSize()===0||N.snapshotVersion.toMicroseconds()-C.snapshotVersion.toMicroseconds()>=rP?!0:E.addedDocuments.size+E.modifiedDocuments.size+E.removedDocuments.size>0}(g,x,f)&&l.push(n.hi.updateTargetData(i,x))});let u=rr(),c=ie();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(i,f))}),l.push(lP(i,o,e.documentUpdates).next(f=>{u=f.Ls,c=f.ks})),!r.isEqual(X.min())){const f=n.hi.getLastRemoteSnapshotVersion(i).next(m=>n.hi.setTargetsMetadata(i,i.currentSequenceNumber,r));l.push(f)}return F.waitFor(l).next(()=>o.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,u,c)).next(()=>u)}).then(i=>(n.Fs=s,i))}function lP(t,e,n){let r=ie(),s=ie();return n.forEach(i=>r=r.add(i)),e.getEntries(t,r).next(i=>{let o=rr();return n.forEach((l,u)=>{const c=i.get(l);u.isFoundDocument()!==c.isFoundDocument()&&(s=s.add(l)),u.isNoDocument()&&u.version.isEqual(X.min())?(e.removeEntry(l,u.readTime),o=o.insert(l,u)):!c.isValidDocument()||u.version.compareTo(c.version)>0||u.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(u),o=o.insert(l,u)):H(gm,"Ignoring outdated watch update for ",l,". Current version:",c.version," Watch version:",u.version)}),{Ls:o,ks:s}})}function uP(t,e){const n=ee(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=rm),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function cP(t,e){const n=ee(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return n.hi.getTargetData(r,e).next(i=>i?(s=i,F.resolve(s)):n.hi.allocateTargetId(r).next(o=>(s=new br(e,o,"TargetPurposeListen",r.currentSequenceNumber),n.hi.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=n.Fs.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(n.Fs=n.Fs.insert(r.targetId,r),n.Ms.set(e,r.targetId)),r})}async function Wf(t,e,n){const r=ee(t),s=r.Fs.get(e),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,o=>r.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!so(o))throw o;H(gm,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Fs=r.Fs.remove(e),r.Ms.delete(s.target)}function d_(t,e,n){const r=ee(t);let s=X.min(),i=ie();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,c,f){const m=ee(u),g=m.Ms.get(f);return g!==void 0?F.resolve(m.Fs.get(g)):m.hi.getTargetData(c,f)}(r,o,bn(e)).next(l=>{if(l)return s=l.lastLimboFreeSnapshotVersion,r.hi.getMatchingKeysForTargetId(o,l.targetId).next(u=>{i=u})}).next(()=>r.Cs.getDocumentsMatchingQuery(o,e,n?s:X.min(),n?i:ie())).next(l=>(dP(r,YN(e),l),{documents:l,qs:i})))}function dP(t,e,n){let r=t.xs.get(e)||X.min();n.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),t.xs.set(e,r)}class h_{constructor(){this.activeTargetIds=nR()}Gs(e){this.activeTargetIds=this.activeTargetIds.add(e)}zs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class hP{constructor(){this.Fo=new h_,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.Fo.Gs(e),this.Mo[e]||"not-current"}updateQueryState(e,n,r){this.Mo[e]=n}removeLocalQueryTarget(e){this.Fo.zs(e)}isLocalQueryTarget(e){return this.Fo.activeTargetIds.has(e)}clearQueryState(e){delete this.Mo[e]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(e){return this.Fo.activeTargetIds.has(e)}start(){return this.Fo=new h_,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class fP{xo(e){}shutdown(){}}/**
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
 */const f_="ConnectivityMonitor";class p_{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(e){this.ko.push(e)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){H(f_,"Network connectivity changed: AVAILABLE");for(const e of this.ko)e(0)}Lo(){H(f_,"Network connectivity changed: UNAVAILABLE");for(const e of this.ko)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let Gl=null;function Hf(){return Gl===null?Gl=function(){return 268435456+Math.round(2147483648*Math.random())}():Gl++,"0x"+Gl.toString(16)}/**
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
 */const gh="RestConnection",pP={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class mP{get Qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.$o=n+"://"+e.host,this.Uo=`projects/${r}/databases/${s}`,this.Ko=this.databaseId.database===Xu?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Wo(e,n,r,s,i){const o=Hf(),l=this.Go(e,n.toUriEncodedString());H(gh,`Sending RPC '${e}' ${o}:`,l,r);const u={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(u,s,i);const{host:c}=new URL(l),f=or(c);return this.jo(e,l,u,r,f).then(m=>(H(gh,`Received RPC '${e}' ${o}: `,m),m),m=>{throw Wr(gh,`RPC '${e}' ${o} failed with error: `,m,"url: ",l,"request:",r),m})}Jo(e,n,r,s,i,o){return this.Wo(e,n,r,s,i)}zo(e,n,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+no}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((s,i)=>e[i]=s),r&&r.headers.forEach((s,i)=>e[i]=s)}Go(e,n){const r=pP[e];return`${this.$o}/v1/${n}:${r}`}terminate(){}}/**
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
 */class gP{constructor(e){this.Ho=e.Ho,this.Yo=e.Yo}Zo(e){this.Xo=e}e_(e){this.t_=e}n_(e){this.r_=e}onMessage(e){this.i_=e}close(){this.Yo()}send(e){this.Ho(e)}s_(){this.Xo()}o_(){this.t_()}__(e){this.r_(e)}a_(e){this.i_(e)}}/**
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
 */const lt="WebChannelConnection";class yP extends mP{constructor(e){super(e),this.u_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}jo(e,n,r,s,i){const o=Hf();return new Promise((l,u)=>{const c=new dT;c.setWithCredentials(!0),c.listenOnce(hT.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case du.NO_ERROR:const m=c.getResponseJson();H(lt,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(m)),l(m);break;case du.TIMEOUT:H(lt,`RPC '${e}' ${o} timed out`),u(new W(L.DEADLINE_EXCEEDED,"Request time out"));break;case du.HTTP_ERROR:const g=c.getStatus();if(H(lt,`RPC '${e}' ${o} failed with status:`,g,"response text:",c.getResponseText()),g>0){let x=c.getResponseJson();Array.isArray(x)&&(x=x[0]);const A=x==null?void 0:x.error;if(A&&A.status&&A.message){const C=function(E){const y=E.toLowerCase().replace(/_/g,"-");return Object.values(L).indexOf(y)>=0?y:L.UNKNOWN}(A.status);u(new W(C,A.message))}else u(new W(L.UNKNOWN,"Server responded with status "+c.getStatus()))}else u(new W(L.UNAVAILABLE,"Connection failed."));break;default:Y(9055,{c_:e,streamId:o,l_:c.getLastErrorCode(),h_:c.getLastError()})}}finally{H(lt,`RPC '${e}' ${o} completed.`)}});const f=JSON.stringify(s);H(lt,`RPC '${e}' ${o} sending request:`,s),c.send(n,"POST",f,r,15)})}P_(e,n,r){const s=Hf(),i=[this.$o,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=mT(),l=pT(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;c!==void 0&&(u.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(u.useFetchStreams=!0),this.zo(u.initMessageHeaders,n,r),u.encodeInitMessageHeaders=!0;const f=i.join("");H(lt,`Creating RPC '${e}' stream ${s}: ${f}`,u);const m=o.createWebChannel(f,u);this.T_(m);let g=!1,x=!1;const A=new gP({Ho:N=>{x?H(lt,`Not sending because RPC '${e}' stream ${s} is closed:`,N):(g||(H(lt,`Opening RPC '${e}' stream ${s} transport.`),m.open(),g=!0),H(lt,`RPC '${e}' stream ${s} sending:`,N),m.send(N))},Yo:()=>m.close()}),C=(N,E,y)=>{N.listen(E,_=>{try{y(_)}catch(R){setTimeout(()=>{throw R},0)}})};return C(m,zo.EventType.OPEN,()=>{x||(H(lt,`RPC '${e}' stream ${s} transport opened.`),A.s_())}),C(m,zo.EventType.CLOSE,()=>{x||(x=!0,H(lt,`RPC '${e}' stream ${s} transport closed`),A.__(),this.I_(m))}),C(m,zo.EventType.ERROR,N=>{x||(x=!0,Wr(lt,`RPC '${e}' stream ${s} transport errored. Name:`,N.name,"Message:",N.message),A.__(new W(L.UNAVAILABLE,"The operation could not be completed")))}),C(m,zo.EventType.MESSAGE,N=>{var E;if(!x){const y=N.data[0];de(!!y,16349);const _=y,R=(_==null?void 0:_.error)||((E=_[0])===null||E===void 0?void 0:E.error);if(R){H(lt,`RPC '${e}' stream ${s} received error:`,R);const V=R.status;let j=function(S){const T=Me[S];if(T!==void 0)return XT(T)}(V),I=R.message;j===void 0&&(j=L.INTERNAL,I="Unknown error status: "+V+" with message "+R.message),x=!0,A.__(new W(j,I)),m.close()}else H(lt,`RPC '${e}' stream ${s} received:`,y),A.a_(y)}}),C(l,fT.STAT_EVENT,N=>{N.stat===Df.PROXY?H(lt,`RPC '${e}' stream ${s} detected buffering proxy`):N.stat===Df.NOPROXY&&H(lt,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{A.o_()},0),A}terminate(){this.u_.forEach(e=>e.close()),this.u_=[]}T_(e){this.u_.push(e)}I_(e){this.u_=this.u_.filter(n=>n===e)}}function yh(){return typeof document<"u"?document:null}/**
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
 */function Yc(t){return new ER(t,!0)}/**
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
 */class dx{constructor(e,n,r=1e3,s=1.5,i=6e4){this.Fi=e,this.timerId=n,this.d_=r,this.E_=s,this.A_=i,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const n=Math.floor(this.R_+this.p_()),r=Math.max(0,Date.now()-this.m_),s=Math.max(0,n-r);s>0&&H("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.R_} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,s,()=>(this.m_=Date.now(),e())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
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
 */const m_="PersistentStream";class hx{constructor(e,n,r,s,i,o,l,u){this.Fi=e,this.w_=r,this.S_=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=l,this.listener=u,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new dx(e,n)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.C_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,()=>this.L_()))}k_(e){this.q_(),this.stream.send(e)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,e!==4?this.F_.reset():n&&n.code===L.RESOURCE_EXHAUSTED?(nr(n.toString()),nr("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):n&&n.code===L.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.n_(n)}U_(){}auth(){this.state=1;const e=this.K_(this.b_),n=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.b_===n&&this.W_(r,s)},r=>{e(()=>{const s=new W(L.UNKNOWN,"Fetching auth token failed: "+r.message);return this.G_(s)})})}W_(e,n){const r=this.K_(this.b_);this.stream=this.z_(e,n),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.e_(()=>{r(()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,()=>(this.x_()&&(this.state=3),Promise.resolve())),this.listener.e_()))}),this.stream.n_(s=>{r(()=>this.G_(s))}),this.stream.onMessage(s=>{r(()=>++this.C_==1?this.j_(s):this.onNext(s))})}O_(){this.state=5,this.F_.g_(async()=>{this.state=0,this.start()})}G_(e){return H(m_,`close with error: ${e}`),this.stream=null,this.close(4,e)}K_(e){return n=>{this.Fi.enqueueAndForget(()=>this.b_===e?n():(H(m_,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class vP extends hx{constructor(e,n,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,s,o),this.serializer=i}z_(e,n){return this.connection.P_("Listen",e,n)}j_(e){return this.onNext(e)}onNext(e){this.F_.reset();const n=IR(this.serializer,e),r=function(i){if(!("targetChange"in i))return X.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?X.min():o.readTime?Nn(o.readTime):X.min()}(e);return this.listener.J_(n,r)}H_(e){const n={};n.database=zf(this.serializer),n.addTarget=function(i,o){let l;const u=o.target;if(l=Vf(u)?{documents:kR(i,u)}:{query:bR(i,u).Vt},l.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){l.resumeToken=ex(i,o.resumeToken);const c=Uf(i,o.expectedCount);c!==null&&(l.expectedCount=c)}else if(o.snapshotVersion.compareTo(X.min())>0){l.readTime=nc(i,o.snapshotVersion.toTimestamp());const c=Uf(i,o.expectedCount);c!==null&&(l.expectedCount=c)}return l}(this.serializer,e);const r=NR(this.serializer,e);r&&(n.labels=r),this.k_(n)}Y_(e){const n={};n.database=zf(this.serializer),n.removeTarget=e,this.k_(n)}}class _P extends hx{constructor(e,n,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,s,o),this.serializer=i}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(e,n){return this.connection.P_("Write",e,n)}j_(e){return de(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,de(!e.writeResults||e.writeResults.length===0,55816),this.listener.ea()}onNext(e){de(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.F_.reset();const n=AR(e.writeResults,e.commitTime),r=Nn(e.commitTime);return this.listener.ta(r,n)}na(){const e={};e.database=zf(this.serializer),this.k_(e)}X_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>SR(this.serializer,r))};this.k_(n)}}/**
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
 */class wP{}class EP extends wP{constructor(e,n,r,s){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=s,this.ra=!1}ia(){if(this.ra)throw new W(L.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,r,s){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Wo(e,Bf(n,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new W(L.UNKNOWN,i.toString())})}Jo(e,n,r,s,i){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.Jo(e,Bf(n,r),s,o,l,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new W(L.UNKNOWN,o.toString())})}terminate(){this.ra=!0,this.connection.terminate()}}class TP{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve())))}la(e){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ua("Offline")))}set(e){this.ha(),this.sa=0,e==="Online"&&(this._a=!1),this.ua(e)}ua(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ca(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(nr(n),this._a=!1):H("OnlineStateTracker",n)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}}/**
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
 */const Ls="RemoteStore";class xP{constructor(e,n,r,s,i){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=i,this.Ea.xo(o=>{r.enqueueAndForget(async()=>{Xs(this)&&(H(Ls,"Restarting streams for network reachability change."),await async function(u){const c=ee(u);c.Ia.add(4),await el(c),c.Aa.set("Unknown"),c.Ia.delete(4),await Xc(c)}(this))})}),this.Aa=new TP(r,s)}}async function Xc(t){if(Xs(t))for(const e of t.da)await e(!0)}async function el(t){for(const e of t.da)await e(!1)}function fx(t,e){const n=ee(t);n.Ta.has(e.targetId)||(n.Ta.set(e.targetId,e),wm(n)?_m(n):oo(n).x_()&&vm(n,e))}function ym(t,e){const n=ee(t),r=oo(n);n.Ta.delete(e),r.x_()&&px(n,e),n.Ta.size===0&&(r.x_()?r.B_():Xs(n)&&n.Aa.set("Unknown"))}function vm(t,e){if(t.Ra.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(X.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}oo(t).H_(e)}function px(t,e){t.Ra.$e(e),oo(t).Y_(e)}function _m(t){t.Ra=new yR({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>t.Ta.get(e)||null,lt:()=>t.datastore.serializer.databaseId}),oo(t).start(),t.Aa.aa()}function wm(t){return Xs(t)&&!oo(t).M_()&&t.Ta.size>0}function Xs(t){return ee(t).Ia.size===0}function mx(t){t.Ra=void 0}async function IP(t){t.Aa.set("Online")}async function SP(t){t.Ta.forEach((e,n)=>{vm(t,e)})}async function AP(t,e){mx(t),wm(t)?(t.Aa.la(e),_m(t)):t.Aa.set("Unknown")}async function kP(t,e,n){if(t.Aa.set("Online"),e instanceof ZT&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const l of i.targetIds)s.Ta.has(l)&&(await s.remoteSyncer.rejectListen(l,o),s.Ta.delete(l),s.Ra.removeTarget(l))}(t,e)}catch(r){H(Ls,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await sc(t,r)}else if(e instanceof mu?t.Ra.Ye(e):e instanceof JT?t.Ra.it(e):t.Ra.et(e),!n.isEqual(X.min()))try{const r=await cx(t.localStore);n.compareTo(r)>=0&&await function(i,o){const l=i.Ra.Pt(o);return l.targetChanges.forEach((u,c)=>{if(u.resumeToken.approximateByteSize()>0){const f=i.Ta.get(c);f&&i.Ta.set(c,f.withResumeToken(u.resumeToken,o))}}),l.targetMismatches.forEach((u,c)=>{const f=i.Ta.get(u);if(!f)return;i.Ta.set(u,f.withResumeToken(tt.EMPTY_BYTE_STRING,f.snapshotVersion)),px(i,u);const m=new br(f.target,u,c,f.sequenceNumber);vm(i,m)}),i.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){H(Ls,"Failed to raise snapshot:",r),await sc(t,r)}}async function sc(t,e,n){if(!so(e))throw e;t.Ia.add(1),await el(t),t.Aa.set("Offline"),n||(n=()=>cx(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{H(Ls,"Retrying IndexedDB access"),await n(),t.Ia.delete(1),await Xc(t)})}function gx(t,e){return e().catch(n=>sc(t,n,e))}async function Jc(t){const e=ee(t),n=Qr(e);let r=e.Pa.length>0?e.Pa[e.Pa.length-1].batchId:rm;for(;bP(e);)try{const s=await uP(e.localStore,r);if(s===null){e.Pa.length===0&&n.B_();break}r=s.batchId,CP(e,s)}catch(s){await sc(e,s)}yx(e)&&vx(e)}function bP(t){return Xs(t)&&t.Pa.length<10}function CP(t,e){t.Pa.push(e);const n=Qr(t);n.x_()&&n.Z_&&n.X_(e.mutations)}function yx(t){return Xs(t)&&!Qr(t).M_()&&t.Pa.length>0}function vx(t){Qr(t).start()}async function NP(t){Qr(t).na()}async function RP(t){const e=Qr(t);for(const n of t.Pa)e.X_(n.mutations)}async function PP(t,e,n){const r=t.Pa.shift(),s=cm.from(r,e,n);await gx(t,()=>t.remoteSyncer.applySuccessfulWrite(s)),await Jc(t)}async function DP(t,e){e&&Qr(t).Z_&&await async function(r,s){if(function(o){return mR(o)&&o!==L.ABORTED}(s.code)){const i=r.Pa.shift();Qr(r).N_(),await gx(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Jc(r)}}(t,e),yx(t)&&vx(t)}async function g_(t,e){const n=ee(t);n.asyncQueue.verifyOperationInProgress(),H(Ls,"RemoteStore received new credentials");const r=Xs(n);n.Ia.add(3),await el(n),r&&n.Aa.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ia.delete(3),await Xc(n)}async function OP(t,e){const n=ee(t);e?(n.Ia.delete(2),await Xc(n)):e||(n.Ia.add(2),await el(n),n.Aa.set("Unknown"))}function oo(t){return t.Va||(t.Va=function(n,r,s){const i=ee(n);return i.ia(),new vP(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Zo:IP.bind(null,t),e_:SP.bind(null,t),n_:AP.bind(null,t),J_:kP.bind(null,t)}),t.da.push(async e=>{e?(t.Va.N_(),wm(t)?_m(t):t.Aa.set("Unknown")):(await t.Va.stop(),mx(t))})),t.Va}function Qr(t){return t.ma||(t.ma=function(n,r,s){const i=ee(n);return i.ia(),new _P(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Zo:()=>Promise.resolve(),e_:NP.bind(null,t),n_:DP.bind(null,t),ea:RP.bind(null,t),ta:PP.bind(null,t)}),t.da.push(async e=>{e?(t.ma.N_(),await Jc(t)):(await t.ma.stop(),t.Pa.length>0&&(H(Ls,`Stopping write stream with ${t.Pa.length} pending writes`),t.Pa=[]))})),t.ma}/**
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
 */class Em{constructor(e,n,r,s,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Ur,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,s,i){const o=Date.now()+r,l=new Em(e,n,o,s,i);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new W(L.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Tm(t,e){if(nr("AsyncQueue",`${e}: ${t}`),so(t))return new W(L.UNAVAILABLE,`${e}: ${t}`);throw t}/**
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
 */class Ci{static emptySet(e){return new Ci(e.comparator)}constructor(e){this.comparator=e?(n,r)=>e(n,r)||G.comparator(n.key,r.key):(n,r)=>G.comparator(n.key,r.key),this.keyedMap=Wo(),this.sortedSet=new ke(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof Ci)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new Ci;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
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
 */class y_{constructor(){this.fa=new ke(G.comparator)}track(e){const n=e.doc.key,r=this.fa.get(n);r?e.type!==0&&r.type===3?this.fa=this.fa.insert(n,e):e.type===3&&r.type!==1?this.fa=this.fa.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.fa=this.fa.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.fa=this.fa.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.fa=this.fa.remove(n):e.type===1&&r.type===2?this.fa=this.fa.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.fa=this.fa.insert(n,{type:2,doc:e.doc}):Y(63341,{At:e,ga:r}):this.fa=this.fa.insert(n,e)}pa(){const e=[];return this.fa.inorderTraversal((n,r)=>{e.push(r)}),e}}class qi{constructor(e,n,r,s,i,o,l,u,c){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=l,this.excludesMetadataChanges=u,this.hasCachedResults=c}static fromInitialDocuments(e,n,r,s,i){const o=[];return n.forEach(l=>{o.push({type:0,doc:l})}),new qi(e,n,Ci.emptySet(n),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Hc(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let s=0;s<n.length;s++)if(n[s].type!==r[s].type||!n[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
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
 */class MP{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some(e=>e.ba())}}class jP{constructor(){this.queries=v_(),this.onlineState="Unknown",this.Da=new Set}terminate(){(function(n,r){const s=ee(n),i=s.queries;s.queries=v_(),i.forEach((o,l)=>{for(const u of l.wa)u.onError(r)})})(this,new W(L.ABORTED,"Firestore shutting down"))}}function v_(){return new Ys(t=>VT(t),Hc)}async function _x(t,e){const n=ee(t);let r=3;const s=e.query;let i=n.queries.get(s);i?!i.Sa()&&e.ba()&&(r=2):(i=new MP,r=e.ba()?0:1);try{switch(r){case 0:i.ya=await n.onListen(s,!0);break;case 1:i.ya=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(o){const l=Tm(o,`Initialization of query '${li(e.query)}' failed`);return void e.onError(l)}n.queries.set(s,i),i.wa.push(e),e.va(n.onlineState),i.ya&&e.Ca(i.ya)&&xm(n)}async function wx(t,e){const n=ee(t),r=e.query;let s=3;const i=n.queries.get(r);if(i){const o=i.wa.indexOf(e);o>=0&&(i.wa.splice(o,1),i.wa.length===0?s=e.ba()?0:1:!i.Sa()&&e.ba()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function LP(t,e){const n=ee(t);let r=!1;for(const s of e){const i=s.query,o=n.queries.get(i);if(o){for(const l of o.wa)l.Ca(s)&&(r=!0);o.ya=s}}r&&xm(n)}function VP(t,e,n){const r=ee(t),s=r.queries.get(e);if(s)for(const i of s.wa)i.onError(n);r.queries.delete(e)}function xm(t){t.Da.forEach(e=>{e.next()})}var qf,__;(__=qf||(qf={})).Fa="default",__.Cache="cache";class Ex{constructor(e,n,r){this.query=e,this.Ma=n,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=r||{}}Ca(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new qi(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.xa?this.Na(e)&&(this.Ma.next(e),n=!0):this.Ba(e,this.onlineState)&&(this.La(e),n=!0),this.Oa=e,n}onError(e){this.Ma.error(e)}va(e){this.onlineState=e;let n=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,e)&&(this.La(this.Oa),n=!0),n}Ba(e,n){if(!e.fromCache||!this.ba())return!0;const r=n!=="Offline";return(!this.options.ka||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Na(e){if(e.docChanges.length>0)return!0;const n=this.Oa&&this.Oa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}La(e){e=qi.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.xa=!0,this.Ma.next(e)}ba(){return this.options.source!==qf.Cache}}/**
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
 */class Tx{constructor(e){this.key=e}}class xx{constructor(e){this.key=e}}class FP{constructor(e,n){this.query=e,this.Ha=n,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=ie(),this.mutatedKeys=ie(),this.Xa=FT(e),this.eu=new Ci(this.Xa)}get tu(){return this.Ha}nu(e,n){const r=n?n.ru:new y_,s=n?n.eu:this.eu;let i=n?n.mutatedKeys:this.mutatedKeys,o=s,l=!1;const u=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,c=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,m)=>{const g=s.get(f),x=qc(this.query,m)?m:null,A=!!g&&this.mutatedKeys.has(g.key),C=!!x&&(x.hasLocalMutations||this.mutatedKeys.has(x.key)&&x.hasCommittedMutations);let N=!1;g&&x?g.data.isEqual(x.data)?A!==C&&(r.track({type:3,doc:x}),N=!0):this.iu(g,x)||(r.track({type:2,doc:x}),N=!0,(u&&this.Xa(x,u)>0||c&&this.Xa(x,c)<0)&&(l=!0)):!g&&x?(r.track({type:0,doc:x}),N=!0):g&&!x&&(r.track({type:1,doc:g}),N=!0,(u||c)&&(l=!0)),N&&(x?(o=o.add(x),i=C?i.add(f):i.delete(f)):(o=o.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),i=i.delete(f.key),r.track({type:1,doc:f})}return{eu:o,ru:r,Ds:l,mutatedKeys:i}}iu(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,s){const i=this.eu;this.eu=e.eu,this.mutatedKeys=e.mutatedKeys;const o=e.ru.pa();o.sort((f,m)=>function(x,A){const C=N=>{switch(N){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Y(20277,{At:N})}};return C(x)-C(A)}(f.type,m.type)||this.Xa(f.doc,m.doc)),this.su(r),s=s!=null&&s;const l=n&&!s?this.ou():[],u=this.Za.size===0&&this.current&&!s?1:0,c=u!==this.Ya;return this.Ya=u,o.length!==0||c?{snapshot:new qi(this.query,e.eu,i,o,e.mutatedKeys,u===0,c,!1,!!r&&r.resumeToken.approximateByteSize()>0),_u:l}:{_u:l}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({eu:this.eu,ru:new y_,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(e){return!this.Ha.has(e)&&!!this.eu.has(e)&&!this.eu.get(e).hasLocalMutations}su(e){e&&(e.addedDocuments.forEach(n=>this.Ha=this.Ha.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ha=this.Ha.delete(n)),this.current=e.current)}ou(){if(!this.current)return[];const e=this.Za;this.Za=ie(),this.eu.forEach(r=>{this.au(r.key)&&(this.Za=this.Za.add(r.key))});const n=[];return e.forEach(r=>{this.Za.has(r)||n.push(new xx(r))}),this.Za.forEach(r=>{e.has(r)||n.push(new Tx(r))}),n}uu(e){this.Ha=e.qs,this.Za=ie();const n=this.nu(e.documents);return this.applyChanges(n,!0)}cu(){return qi.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,this.Ya===0,this.hasCachedResults)}}const Im="SyncEngine";class UP{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class BP{constructor(e){this.key=e,this.lu=!1}}class $P{constructor(e,n,r,s,i,o){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.hu={},this.Pu=new Ys(l=>VT(l),Hc),this.Tu=new Map,this.Iu=new Set,this.du=new ke(G.comparator),this.Eu=new Map,this.Au=new fm,this.Ru={},this.Vu=new Map,this.mu=Hi.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return this.fu===!0}}async function zP(t,e,n=!0){const r=Cx(t);let s;const i=r.Pu.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cu()):s=await Ix(r,e,n,!0),s}async function WP(t,e){const n=Cx(t);await Ix(n,e,!0,!1)}async function Ix(t,e,n,r){const s=await cP(t.localStore,bn(e)),i=s.targetId,o=t.sharedClientState.addLocalQueryTarget(i,n);let l;return r&&(l=await HP(t,e,i,o==="current",s.resumeToken)),t.isPrimaryClient&&n&&fx(t.remoteStore,s),l}async function HP(t,e,n,r,s){t.gu=(m,g,x)=>async function(C,N,E,y){let _=N.view.nu(E);_.Ds&&(_=await d_(C.localStore,N.query,!1).then(({documents:I})=>N.view.nu(I,_)));const R=y&&y.targetChanges.get(N.targetId),V=y&&y.targetMismatches.get(N.targetId)!=null,j=N.view.applyChanges(_,C.isPrimaryClient,R,V);return E_(C,N.targetId,j._u),j.snapshot}(t,m,g,x);const i=await d_(t.localStore,e,!0),o=new FP(e,i.qs),l=o.nu(i.documents),u=Za.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",s),c=o.applyChanges(l,t.isPrimaryClient,u);E_(t,n,c._u);const f=new UP(e,n,o);return t.Pu.set(e,f),t.Tu.has(n)?t.Tu.get(n).push(e):t.Tu.set(n,[e]),c.snapshot}async function qP(t,e,n){const r=ee(t),s=r.Pu.get(e),i=r.Tu.get(s.targetId);if(i.length>1)return r.Tu.set(s.targetId,i.filter(o=>!Hc(o,e))),void r.Pu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Wf(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&ym(r.remoteStore,s.targetId),Gf(r,s.targetId)}).catch(ro)):(Gf(r,s.targetId),await Wf(r.localStore,s.targetId,!0))}async function GP(t,e){const n=ee(t),r=n.Pu.get(e),s=n.Tu.get(r.targetId);n.isPrimaryClient&&s.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),ym(n.remoteStore,r.targetId))}async function KP(t,e,n){const r=t2(t);try{const s=await function(o,l){const u=ee(o),c=we.now(),f=l.reduce((x,A)=>x.add(A.key),ie());let m,g;return u.persistence.runTransaction("Locally write mutations","readwrite",x=>{let A=rr(),C=ie();return u.Os.getEntries(x,f).next(N=>{A=N,A.forEach((E,y)=>{y.isValidDocument()||(C=C.add(E))})}).next(()=>u.localDocuments.getOverlayedDocuments(x,A)).next(N=>{m=N;const E=[];for(const y of l){const _=cR(y,m.get(y.key).overlayedDocument);_!=null&&E.push(new rs(y.key,_,NT(_.value.mapValue),Cn.exists(!0)))}return u.mutationQueue.addMutationBatch(x,c,E,l)}).next(N=>{g=N;const E=N.applyToLocalDocumentSet(m,C);return u.documentOverlayCache.saveOverlays(x,N.batchId,E)})}).then(()=>({batchId:g.batchId,changes:BT(m)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(o,l,u){let c=o.Ru[o.currentUser.toKey()];c||(c=new ke(ne)),c=c.insert(l,u),o.Ru[o.currentUser.toKey()]=c}(r,s.batchId,n),await tl(r,s.changes),await Jc(r.remoteStore)}catch(s){const i=Tm(s,"Failed to persist write");n.reject(i)}}async function Sx(t,e){const n=ee(t);try{const r=await aP(n.localStore,e);e.targetChanges.forEach((s,i)=>{const o=n.Eu.get(i);o&&(de(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.lu=!0:s.modifiedDocuments.size>0?de(o.lu,14607):s.removedDocuments.size>0&&(de(o.lu,42227),o.lu=!1))}),await tl(n,r,e)}catch(r){await ro(r)}}function w_(t,e,n){const r=ee(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const s=[];r.Pu.forEach((i,o)=>{const l=o.view.va(e);l.snapshot&&s.push(l.snapshot)}),function(o,l){const u=ee(o);u.onlineState=l;let c=!1;u.queries.forEach((f,m)=>{for(const g of m.wa)g.va(l)&&(c=!0)}),c&&xm(u)}(r.eventManager,e),s.length&&r.hu.J_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function QP(t,e,n){const r=ee(t);r.sharedClientState.updateQueryState(e,"rejected",n);const s=r.Eu.get(e),i=s&&s.key;if(i){let o=new ke(G.comparator);o=o.insert(i,dt.newNoDocument(i,X.min()));const l=ie().add(i),u=new Qc(X.min(),new Map,new ke(ne),o,l);await Sx(r,u),r.du=r.du.remove(i),r.Eu.delete(e),Sm(r)}else await Wf(r.localStore,e,!1).then(()=>Gf(r,e,n)).catch(ro)}async function YP(t,e){const n=ee(t),r=e.batch.batchId;try{const s=await oP(n.localStore,e);kx(n,r,null),Ax(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await tl(n,s)}catch(s){await ro(s)}}async function XP(t,e,n){const r=ee(t);try{const s=await function(o,l){const u=ee(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",c=>{let f;return u.mutationQueue.lookupMutationBatch(c,l).next(m=>(de(m!==null,37113),f=m.keys(),u.mutationQueue.removeMutationBatch(c,m))).next(()=>u.mutationQueue.performConsistencyCheck(c)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(c,f,l)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(c,f)).next(()=>u.localDocuments.getDocuments(c,f))})}(r.localStore,e);kx(r,e,n),Ax(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await tl(r,s)}catch(s){await ro(s)}}function Ax(t,e){(t.Vu.get(e)||[]).forEach(n=>{n.resolve()}),t.Vu.delete(e)}function kx(t,e,n){const r=ee(t);let s=r.Ru[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(n?i.reject(n):i.resolve(),s=s.remove(e)),r.Ru[r.currentUser.toKey()]=s}}function Gf(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Tu.get(e))t.Pu.delete(r),n&&t.hu.pu(r,n);t.Tu.delete(e),t.isPrimaryClient&&t.Au.zr(e).forEach(r=>{t.Au.containsKey(r)||bx(t,r)})}function bx(t,e){t.Iu.delete(e.path.canonicalString());const n=t.du.get(e);n!==null&&(ym(t.remoteStore,n),t.du=t.du.remove(e),t.Eu.delete(n),Sm(t))}function E_(t,e,n){for(const r of n)r instanceof Tx?(t.Au.addReference(r.key,e),JP(t,r)):r instanceof xx?(H(Im,"Document no longer in limbo: "+r.key),t.Au.removeReference(r.key,e),t.Au.containsKey(r.key)||bx(t,r.key)):Y(19791,{yu:r})}function JP(t,e){const n=e.key,r=n.path.canonicalString();t.du.get(n)||t.Iu.has(r)||(H(Im,"New document in limbo: "+n),t.Iu.add(r),Sm(t))}function Sm(t){for(;t.Iu.size>0&&t.du.size<t.maxConcurrentLimboResolutions;){const e=t.Iu.values().next().value;t.Iu.delete(e);const n=new G(ge.fromString(e)),r=t.mu.next();t.Eu.set(r,new BP(n)),t.du=t.du.insert(n,r),fx(t.remoteStore,new br(bn(lm(n.path)),r,"TargetPurposeLimboResolution",$c.ue))}}async function tl(t,e,n){const r=ee(t),s=[],i=[],o=[];r.Pu.isEmpty()||(r.Pu.forEach((l,u)=>{o.push(r.gu(u,e,n).then(c=>{var f;if((c||n)&&r.isPrimaryClient){const m=c?!c.fromCache:(f=n==null?void 0:n.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,m?"current":"not-current")}if(c){s.push(c);const m=mm.Es(u.targetId,c);i.push(m)}}))}),await Promise.all(o),r.hu.J_(s),await async function(u,c){const f=ee(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>F.forEach(c,g=>F.forEach(g.Is,x=>f.persistence.referenceDelegate.addReference(m,g.targetId,x)).next(()=>F.forEach(g.ds,x=>f.persistence.referenceDelegate.removeReference(m,g.targetId,x)))))}catch(m){if(!so(m))throw m;H(gm,"Failed to update sequence numbers: "+m)}for(const m of c){const g=m.targetId;if(!m.fromCache){const x=f.Fs.get(g),A=x.snapshotVersion,C=x.withLastLimboFreeSnapshotVersion(A);f.Fs=f.Fs.insert(g,C)}}}(r.localStore,i))}async function ZP(t,e){const n=ee(t);if(!n.currentUser.isEqual(e)){H(Im,"User change. New user:",e.toKey());const r=await ux(n.localStore,e);n.currentUser=e,function(i,o){i.Vu.forEach(l=>{l.forEach(u=>{u.reject(new W(L.CANCELLED,o))})}),i.Vu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await tl(n,r.Bs)}}function e2(t,e){const n=ee(t),r=n.Eu.get(e);if(r&&r.lu)return ie().add(r.key);{let s=ie();const i=n.Tu.get(e);if(!i)return s;for(const o of i){const l=n.Pu.get(o);s=s.unionWith(l.view.tu)}return s}}function Cx(t){const e=ee(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=Sx.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=e2.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=QP.bind(null,e),e.hu.J_=LP.bind(null,e.eventManager),e.hu.pu=VP.bind(null,e.eventManager),e}function t2(t){const e=ee(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=YP.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=XP.bind(null,e),e}class ic{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Yc(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Du(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Cu(e,this.localStore),this.indexBackfillerScheduler=this.Fu(e,this.localStore)}Cu(e,n){return null}Fu(e,n){return null}vu(e){return iP(this.persistence,new nP,e.initialUser,this.serializer)}Du(e){return new lx(pm.Vi,this.serializer)}bu(e){return new hP}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ic.provider={build:()=>new ic};class n2 extends ic{constructor(e){super(),this.cacheSizeBytes=e}Cu(e,n){de(this.persistence.referenceDelegate instanceof rc,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new BR(r,e.asyncQueue,n)}Du(e){const n=this.cacheSizeBytes!==void 0?kt.withCacheSize(this.cacheSizeBytes):kt.DEFAULT;return new lx(r=>rc.Vi(r,n),this.serializer)}}class Kf{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>w_(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=ZP.bind(null,this.syncEngine),await OP(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new jP}()}createDatastore(e){const n=Yc(e.databaseInfo.databaseId),r=function(i){return new yP(i)}(e.databaseInfo);return function(i,o,l,u){return new EP(i,o,l,u)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,s,i,o,l){return new xP(r,s,i,o,l)}(this.localStore,this.datastore,e.asyncQueue,n=>w_(this.syncEngine,n,0),function(){return p_.C()?new p_:new fP}())}createSyncEngine(e,n){return function(s,i,o,l,u,c,f){const m=new $P(s,i,o,l,u,c);return f&&(m.fu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(s){const i=ee(s);H(Ls,"RemoteStore shutting down."),i.Ia.add(5),await el(i),i.Ea.shutdown(),i.Aa.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}Kf.provider={build:()=>new Kf};/**
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
 */class Nx{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.xu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.xu(this.observer.error,e):nr("Uncaught Error in snapshot listener:",e.toString()))}Ou(){this.muted=!0}xu(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
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
 */const Yr="FirestoreClient";class r2{constructor(e,n,r,s,i){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=s,this.user=ut.UNAUTHENTICATED,this.clientId=nm.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async o=>{H(Yr,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(H(Yr,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ur;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=Tm(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function vh(t,e){t.asyncQueue.verifyOperationInProgress(),H(Yr,"Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async s=>{r.isEqual(s)||(await ux(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>{Wr("Terminating Firestore due to IndexedDb database deletion"),t.terminate().then(()=>{H("Terminating Firestore due to IndexedDb database deletion completed successfully")}).catch(s=>{Wr("Terminating Firestore due to IndexedDb database deletion failed",s)})}),t._offlineComponents=e}async function T_(t,e){t.asyncQueue.verifyOperationInProgress();const n=await s2(t);H(Yr,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>g_(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,s)=>g_(e.remoteStore,s)),t._onlineComponents=e}async function s2(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){H(Yr,"Using user provided OfflineComponentProvider");try{await vh(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(s){return s.name==="FirebaseError"?s.code===L.FAILED_PRECONDITION||s.code===L.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(n))throw n;Wr("Error using user provided cache. Falling back to memory cache: "+n),await vh(t,new ic)}}else H(Yr,"Using default OfflineComponentProvider"),await vh(t,new n2(void 0));return t._offlineComponents}async function Rx(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(H(Yr,"Using user provided OnlineComponentProvider"),await T_(t,t._uninitializedComponentsProvider._online)):(H(Yr,"Using default OnlineComponentProvider"),await T_(t,new Kf))),t._onlineComponents}function i2(t){return Rx(t).then(e=>e.syncEngine)}async function Qf(t){const e=await Rx(t),n=e.eventManager;return n.onListen=zP.bind(null,e.syncEngine),n.onUnlisten=qP.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=WP.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=GP.bind(null,e.syncEngine),n}function o2(t,e,n={}){const r=new Ur;return t.asyncQueue.enqueueAndForget(async()=>function(i,o,l,u,c){const f=new Nx({next:g=>{f.Ou(),o.enqueueAndForget(()=>wx(i,m)),g.fromCache&&u.source==="server"?c.reject(new W(L.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(g)},error:g=>c.reject(g)}),m=new Ex(l,f,{includeMetadataChanges:!0,ka:!0});return _x(i,m)}(await Qf(t),t.asyncQueue,e,n,r)),r.promise}/**
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
 */function Px(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
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
 */const x_=new Map;/**
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
 */const Dx="firestore.googleapis.com",I_=!0;class S_{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new W(L.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Dx,this.ssl=I_}else this.host=e.host,this.ssl=(n=e.ssl)!==null&&n!==void 0?n:I_;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=ax;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<FR)throw new W(L.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}TN("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Px((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new W(L.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new W(L.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new W(L.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Zc{constructor(e,n,r,s){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new S_({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new W(L.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new W(L.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new S_(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new fN;switch(r.type){case"firstParty":return new yN(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new W(L.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=x_.get(n);r&&(H("ComponentProvider","Removing Datastore"),x_.delete(n),r.terminate())}(this),Promise.resolve()}}function a2(t,e,n,r={}){var s;t=Yn(t,Zc);const i=or(e),o=t._getSettings(),l=Object.assign(Object.assign({},o),{emulatorOptions:t._getEmulatorOptions()}),u=`${e}:${n}`;i&&(Vc(`https://${u}`),Fc("Firestore",!0)),o.host!==Dx&&o.host!==u&&Wr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c=Object.assign(Object.assign({},o),{host:u,ssl:i,emulatorOptions:r});if(!Ms(c,l)&&(t._setSettings(c),r.mockUserToken)){let f,m;if(typeof r.mockUserToken=="string")f=r.mockUserToken,m=ut.MOCK_USER;else{f=nT(r.mockUserToken,(s=t._app)===null||s===void 0?void 0:s.options.projectId);const g=r.mockUserToken.sub||r.mockUserToken.user_id;if(!g)throw new W(L.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");m=new ut(g)}t._authCredentials=new pN(new yT(f,m))}}/**
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
 */class ar{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new ar(this.firestore,e,this._query)}}class Ue{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Br(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ue(this.firestore,e,this._key)}toJSON(){return{type:Ue._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,r){if(Xa(n,Ue._jsonSchema))return new Ue(e,r||null,new G(ge.fromString(n.referencePath)))}}Ue._jsonSchemaVersion="firestore/documentReference/1.0",Ue._jsonSchema={type:Fe("string",Ue._jsonSchemaVersion),referencePath:Fe("string")};class Br extends ar{constructor(e,n,r){super(e,n,lm(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ue(this.firestore,null,new G(e))}withConverter(e){return new Br(this.firestore,e,this._path)}}function je(t,e,...n){if(t=ce(t),_T("collection","path",e),t instanceof Zc){const r=ge.fromString(e,...n);return Vv(r),new Br(t,null,r)}{if(!(t instanceof Ue||t instanceof Br))throw new W(L.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(ge.fromString(e,...n));return Vv(r),new Br(t.firestore,null,r)}}function Vs(t,e,...n){if(t=ce(t),arguments.length===1&&(e=nm.newId()),_T("doc","path",e),t instanceof Zc){const r=ge.fromString(e,...n);return Lv(r),new Ue(t,null,new G(r))}{if(!(t instanceof Ue||t instanceof Br))throw new W(L.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(ge.fromString(e,...n));return Lv(r),new Ue(t.firestore,t instanceof Br?t.converter:null,new G(r))}}/**
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
 */const A_="AsyncQueue";class k_{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new dx(this,"async_queue_retry"),this.oc=()=>{const r=yh();r&&H(A_,"Visibility state changed to "+r.visibilityState),this.F_.y_()},this._c=e;const n=yh();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const n=yh();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise(()=>{});const n=new Ur;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Zu.push(e),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!so(e))throw e;H(A_,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(e){const n=this._c.then(()=>(this.nc=!0,e().catch(r=>{throw this.tc=r,this.nc=!1,nr("INTERNAL UNHANDLED ERROR: ",b_(r)),r}).then(r=>(this.nc=!1,r))));return this._c=n,n}enqueueAfterDelay(e,n,r){this.ac(),this.sc.indexOf(e)>-1&&(n=0);const s=Em.createAndSchedule(this,e,n,r,i=>this.lc(i));return this.ec.push(s),s}ac(){this.tc&&Y(47125,{hc:b_(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(const n of this.ec)if(n.timerId===e)return!0;return!1}Ic(e){return this.Pc().then(()=>{this.ec.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.ec)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Pc()})}dc(e){this.sc.push(e)}lc(e){const n=this.ec.indexOf(e);this.ec.splice(n,1)}}function b_(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
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
 */function C_(t){return function(n,r){if(typeof n!="object"||n===null)return!1;const s=n;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(t,["next","error","complete"])}class Gi extends Zc{constructor(e,n,r,s){super(e,n,r,s),this.type="firestore",this._queue=new k_,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new k_(e),this._firestoreClient=void 0,await e}}}function Yf(t,e){const n=typeof t=="object"?t:Ya(),r=typeof t=="string"?t:Xu,s=ts(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=Jp("firestore");i&&a2(s,...i)}return s}function Am(t){if(t._terminated)throw new W(L.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||l2(t),t._firestoreClient}function l2(t){var e,n,r;const s=t._freezeSettings(),i=function(l,u,c,f){return new ON(l,u,c,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Px(f.experimentalLongPollingOptions),f.useFetchStreams,f.isUsingEmulator)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,s);t._componentsProvider||!((n=s.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),t._firestoreClient=new r2(t._authCredentials,t._appCheckCredentials,t._queue,i,t._componentsProvider&&function(l){const u=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(u),_online:u}}(t._componentsProvider))}/**
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
 */class Kt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Kt(tt.fromBase64String(e))}catch(n){throw new W(L.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new Kt(tt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Kt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Xa(e,Kt._jsonSchema))return Kt.fromBase64String(e.bytes)}}Kt._jsonSchemaVersion="firestore/bytes/1.0",Kt._jsonSchema={type:Fe("string",Kt._jsonSchemaVersion),bytes:Fe("string")};/**
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
 */class ed{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new W(L.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Je(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class td{constructor(e){this._methodName=e}}/**
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
 */class Rn{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new W(L.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new W(L.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return ne(this._lat,e._lat)||ne(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Rn._jsonSchemaVersion}}static fromJSON(e){if(Xa(e,Rn._jsonSchema))return new Rn(e.latitude,e.longitude)}}Rn._jsonSchemaVersion="firestore/geoPoint/1.0",Rn._jsonSchema={type:Fe("string",Rn._jsonSchemaVersion),latitude:Fe("number"),longitude:Fe("number")};/**
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
 */class Pn{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Pn._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Xa(e,Pn._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new Pn(e.vectorValues);throw new W(L.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Pn._jsonSchemaVersion="firestore/vectorValue/1.0",Pn._jsonSchema={type:Fe("string",Pn._jsonSchemaVersion),vectorValues:Fe("object")};/**
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
 */const u2=/^__.*__$/;class c2{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new rs(e,this.data,this.fieldMask,n,this.fieldTransforms):new Ja(e,this.data,n,this.fieldTransforms)}}class Ox{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new rs(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function Mx(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Y(40011,{Ec:t})}}class km{constructor(e,n,r,s,i,o){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.Ac(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(e){return new km(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Rc({path:r,mc:!1});return s.fc(e),s}gc(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Rc({path:r,mc:!1});return s.Ac(),s}yc(e){return this.Rc({path:void 0,mc:!0})}wc(e){return oc(e,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.fc(this.path.get(e))}fc(e){if(e.length===0)throw this.wc("Document fields must not be empty");if(Mx(this.Ec)&&u2.test(e))throw this.wc('Document fields cannot begin and end with "__"')}}class d2{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||Yc(e)}Dc(e,n,r,s=!1){return new km({Ec:e,methodName:n,bc:r,path:Je.emptyPath(),mc:!1,Sc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function bm(t){const e=t._freezeSettings(),n=Yc(t._databaseId);return new d2(t._databaseId,!!e.ignoreUndefinedProperties,n)}function h2(t,e,n,r,s,i={}){const o=t.Dc(i.merge||i.mergeFields?2:0,e,n,s);Nm("Data must be an object, but it was:",o,r);const l=jx(r,o);let u,c;if(i.merge)u=new Ft(o.fieldMask),c=o.fieldTransforms;else if(i.mergeFields){const f=[];for(const m of i.mergeFields){const g=Xf(e,m,n);if(!o.contains(g))throw new W(L.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);Vx(f,g)||f.push(g)}u=new Ft(f),c=o.fieldTransforms.filter(m=>u.covers(m.field))}else u=null,c=o.fieldTransforms;return new c2(new Nt(l),u,c)}class nd extends td{_toFieldTransform(e){if(e.Ec!==2)throw e.Ec===1?e.wc(`${this._methodName}() can only appear at the top level of your update data`):e.wc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof nd}}class Cm extends td{_toFieldTransform(e){return new oR(e.path,new ja)}isEqual(e){return e instanceof Cm}}function f2(t,e,n,r){const s=t.Dc(1,e,n);Nm("Data must be an object, but it was:",s,r);const i=[],o=Nt.empty();ns(r,(u,c)=>{const f=Rm(e,u,n);c=ce(c);const m=s.gc(f);if(c instanceof nd)i.push(f);else{const g=nl(c,m);g!=null&&(i.push(f),o.set(f,g))}});const l=new Ft(i);return new Ox(o,l,s.fieldTransforms)}function p2(t,e,n,r,s,i){const o=t.Dc(1,e,n),l=[Xf(e,r,n)],u=[s];if(i.length%2!=0)throw new W(L.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)l.push(Xf(e,i[g])),u.push(i[g+1]);const c=[],f=Nt.empty();for(let g=l.length-1;g>=0;--g)if(!Vx(c,l[g])){const x=l[g];let A=u[g];A=ce(A);const C=o.gc(x);if(A instanceof nd)c.push(x);else{const N=nl(A,C);N!=null&&(c.push(x),f.set(x,N))}}const m=new Ft(c);return new Ox(f,m,o.fieldTransforms)}function m2(t,e,n,r=!1){return nl(n,t.Dc(r?4:3,e))}function nl(t,e){if(Lx(t=ce(t)))return Nm("Unsupported field value:",e,t),jx(t,e);if(t instanceof td)return function(r,s){if(!Mx(s.Ec))throw s.wc(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.wc(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.mc&&e.Ec!==4)throw e.wc("Nested arrays are not supported");return function(r,s){const i=[];let o=0;for(const l of r){let u=nl(l,s.yc(o));u==null&&(u={nullValue:"NULL_VALUE"}),i.push(u),o++}return{arrayValue:{values:i}}}(t,e)}return function(r,s){if((r=ce(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return rR(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=we.fromDate(r);return{timestampValue:nc(s.serializer,i)}}if(r instanceof we){const i=new we(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:nc(s.serializer,i)}}if(r instanceof Rn)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Kt)return{bytesValue:ex(s.serializer,r._byteString)};if(r instanceof Ue){const i=s.databaseId,o=r.firestore._databaseId;if(!o.isEqual(i))throw s.wc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:hm(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof Pn)return function(o,l){return{mapValue:{fields:{[bT]:{stringValue:CT},[Ju]:{arrayValue:{values:o.toArray().map(c=>{if(typeof c!="number")throw l.wc("VectorValues must only contain numeric values.");return um(l.serializer,c)})}}}}}}(r,s);throw s.wc(`Unsupported field value: ${Bc(r)}`)}(t,e)}function jx(t,e){const n={};return TT(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):ns(t,(r,s)=>{const i=nl(s,e.Vc(r));i!=null&&(n[r]=i)}),{mapValue:{fields:n}}}function Lx(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof we||t instanceof Rn||t instanceof Kt||t instanceof Ue||t instanceof td||t instanceof Pn)}function Nm(t,e,n){if(!Lx(n)||!wT(n)){const r=Bc(n);throw r==="an object"?e.wc(t+" a custom object"):e.wc(t+" "+r)}}function Xf(t,e,n){if((e=ce(e))instanceof ed)return e._internalPath;if(typeof e=="string")return Rm(t,e);throw oc("Field path arguments must be of type string or ",t,!1,void 0,n)}const g2=new RegExp("[~\\*/\\[\\]]");function Rm(t,e,n){if(e.search(g2)>=0)throw oc(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new ed(...e.split("."))._internalPath}catch{throw oc(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function oc(t,e,n,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let u="";return(i||o)&&(u+=" (found",i&&(u+=` in field ${r}`),o&&(u+=` in document ${s}`),u+=")"),new W(L.INVALID_ARGUMENT,l+t+u)}function Vx(t,e){return t.some(n=>n.isEqual(e))}/**
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
 */class Fx{constructor(e,n,r,s,i){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Ue(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new y2(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(rd("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class y2 extends Fx{data(){return super.data()}}function rd(t,e){return typeof e=="string"?Rm(t,e):e instanceof ed?e._internalPath:e._delegate._internalPath}/**
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
 */function Ux(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new W(L.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Pm{}class Dm extends Pm{}function Ct(t,e,...n){let r=[];e instanceof Pm&&r.push(e),r=r.concat(n),function(i){const o=i.filter(u=>u instanceof Om).length,l=i.filter(u=>u instanceof sd).length;if(o>1||o>0&&l>0)throw new W(L.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)t=s._apply(t);return t}class sd extends Dm{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new sd(e,n,r)}_apply(e){const n=this._parse(e);return $x(e._query,n),new ar(e.firestore,e.converter,Ff(e._query,n))}_parse(e){const n=bm(e.firestore);return function(i,o,l,u,c,f,m){let g;if(c.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new W(L.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){R_(m,f);const A=[];for(const C of m)A.push(N_(u,i,C));g={arrayValue:{values:A}}}else g=N_(u,i,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||R_(m,f),g=m2(l,o,m,f==="in"||f==="not-in");return Ve.create(c,f,g)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function Tt(t,e,n){const r=e,s=rd("where",t);return sd._create(s,r,n)}class Om extends Pm{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new Om(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:yn.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(s,i){let o=s;const l=i.getFlattenedFilters();for(const u of l)$x(o,u),o=Ff(o,u)}(e._query,n),new ar(e.firestore,e.converter,Ff(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Mm extends Dm{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new Mm(e,n)}_apply(e){const n=function(s,i,o){if(s.startAt!==null)throw new W(L.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new W(L.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Ma(i,o)}(e._query,this._field,this._direction);return new ar(e.firestore,e.converter,function(s,i){const o=s.explicitOrderBy.concat([i]);return new io(s.path,s.collectionGroup,o,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,n))}}function Hn(t,e="asc"){const n=e,r=rd("orderBy",t);return Mm._create(r,n)}class jm extends Dm{constructor(e,n,r){super(),this.type=e,this._limit=n,this._limitType=r}static _create(e,n,r){return new jm(e,n,r)}_apply(e){return new ar(e.firestore,e.converter,ec(e._query,this._limit,this._limitType))}}function Bx(t){return xN("limit",t),jm._create("limit",t,"F")}function N_(t,e,n){if(typeof(n=ce(n))=="string"){if(n==="")throw new W(L.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!LT(e)&&n.indexOf("/")!==-1)throw new W(L.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(ge.fromString(n));if(!G.isDocumentKey(r))throw new W(L.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return qv(t,new G(r))}if(n instanceof Ue)return qv(t,n._key);throw new W(L.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Bc(n)}.`)}function R_(t,e){if(!Array.isArray(t)||t.length===0)throw new W(L.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function $x(t,e){const n=function(s,i){for(const o of s)for(const l of o.getFlattenedFilters())if(i.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new W(L.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new W(L.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class v2{convertValue(e,n="none"){switch(Kr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return De(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Gr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw Y(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return ns(e,(s,i)=>{r[s]=this.convertValue(i,n)}),r}convertVectorValue(e){var n,r,s;const i=(s=(r=(n=e.fields)===null||n===void 0?void 0:n[Ju].arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(o=>De(o.doubleValue));return new Pn(i)}convertGeoPoint(e){return new Rn(De(e.latitude),De(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=Wc(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(Pa(e));default:return null}}convertTimestamp(e){const n=qr(e);return new we(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=ge.fromString(e);de(ox(r),9688,{name:e});const s=new Da(r.get(1),r.get(3)),i=new G(r.popFirst(5));return s.isEqual(n)||nr(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}}/**
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
 */function _2(t,e,n){let r;return r=t?t.toFirestore(e):e,r}class qo{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class ks extends Fx{constructor(e,n,r,s,i,o){super(e,n,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new gu(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(rd("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new W(L.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,n={};return n.type=ks._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}}ks._jsonSchemaVersion="firestore/documentSnapshot/1.0",ks._jsonSchema={type:Fe("string",ks._jsonSchemaVersion),bundleSource:Fe("string","DocumentSnapshot"),bundleName:Fe("string"),bundle:Fe("string")};class gu extends ks{data(e={}){return super.data(e)}}class bs{constructor(e,n,r,s){this._firestore=e,this._userDataWriter=n,this._snapshot=s,this.metadata=new qo(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new gu(this._firestore,this._userDataWriter,r.key,r,new qo(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new W(L.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(l=>{const u=new gu(s._firestore,s._userDataWriter,l.doc.key,l.doc,new qo(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);return l.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(l=>i||l.type!==3).map(l=>{const u=new gu(s._firestore,s._userDataWriter,l.doc.key,l.doc,new qo(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);let c=-1,f=-1;return l.type!==0&&(c=o.indexOf(l.doc.key),o=o.delete(l.doc.key)),l.type!==1&&(o=o.add(l.doc),f=o.indexOf(l.doc.key)),{type:w2(l.type),doc:u,oldIndex:c,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new W(L.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=bs._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=nm.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const n=[],r=[],s=[];return this.docs.forEach(i=>{i._document!==null&&(n.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function w2(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Y(61501,{type:t})}}bs._jsonSchemaVersion="firestore/querySnapshot/1.0",bs._jsonSchema={type:Fe("string",bs._jsonSchemaVersion),bundleSource:Fe("string","QuerySnapshot"),bundleName:Fe("string"),bundle:Fe("string")};class Lm extends v2{constructor(e){super(),this.firestore=e}convertBytes(e){return new Kt(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new Ue(this.firestore,null,n)}}function Go(t){t=Yn(t,ar);const e=Yn(t.firestore,Gi),n=Am(e),r=new Lm(e);return Ux(t._query),o2(n,t._query).then(s=>new bs(e,r,t,s))}function yu(t,e,n,...r){t=Yn(t,Ue);const s=Yn(t.firestore,Gi),i=bm(s);let o;return o=typeof(e=ce(e))=="string"||e instanceof ed?p2(i,"updateDoc",t._key,e,n,r):f2(i,"updateDoc",t._key,e),zx(s,[o.toMutation(t._key,Cn.exists(!0))])}function Ni(t,e){const n=Yn(t.firestore,Gi),r=Vs(t),s=_2(t.converter,e);return zx(n,[h2(bm(t.firestore),"addDoc",r._key,s,t.converter!==null,{}).toMutation(r._key,Cn.exists(!1))]).then(()=>r)}function Xt(t,...e){var n,r,s;t=ce(t);let i={includeMetadataChanges:!1,source:"default"},o=0;typeof e[o]!="object"||C_(e[o])||(i=e[o++]);const l={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(C_(e[o])){const m=e[o];e[o]=(n=m.next)===null||n===void 0?void 0:n.bind(m),e[o+1]=(r=m.error)===null||r===void 0?void 0:r.bind(m),e[o+2]=(s=m.complete)===null||s===void 0?void 0:s.bind(m)}let u,c,f;if(t instanceof Ue)c=Yn(t.firestore,Gi),f=lm(t._key.path),u={next:m=>{e[o]&&e[o](E2(c,t,m))},error:e[o+1],complete:e[o+2]};else{const m=Yn(t,ar);c=Yn(m.firestore,Gi),f=m._query;const g=new Lm(c);u={next:x=>{e[o]&&e[o](new bs(c,g,m,x))},error:e[o+1],complete:e[o+2]},Ux(t._query)}return function(g,x,A,C){const N=new Nx(C),E=new Ex(x,N,A);return g.asyncQueue.enqueueAndForget(async()=>_x(await Qf(g),E)),()=>{N.Ou(),g.asyncQueue.enqueueAndForget(async()=>wx(await Qf(g),E))}}(Am(c),f,l,u)}function zx(t,e){return function(r,s){const i=new Ur;return r.asyncQueue.enqueueAndForget(async()=>KP(await i2(r),s,i)),i.promise}(Am(t),e)}function E2(t,e,n){const r=n.docs.get(e._key),s=new Lm(t);return new ks(t,s,e._key,r,new qo(n.hasPendingWrites,n.fromCache),e.converter)}function xn(){return new Cm("serverTimestamp")}(function(e,n=!0){(function(s){no=s})(Qs),en(new zt("firestore",(r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),l=new Gi(new mN(r.getProvider("auth-internal")),new vN(o,r.getProvider("app-check-internal")),function(c,f){if(!Object.prototype.hasOwnProperty.apply(c.options,["projectId"]))throw new W(L.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Da(c.options.projectId,f)}(o,s),o);return i=Object.assign({useFetchStreams:n},i),l._setSettings(i),l},"PUBLIC").setMultipleInstances(!0)),ft(Pv,Dv,e),ft(Pv,Dv,"esm2017")})();function Vm(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(t);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(t,r[s])&&(n[r[s]]=t[r[s]]);return n}function Wx(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const T2=Wx,Hx=new Ks("auth","Firebase",Wx());/**
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
 */const ac=new Zp("@firebase/auth");function x2(t,...e){ac.logLevel<=se.WARN&&ac.warn(`Auth (${Qs}): ${t}`,...e)}function vu(t,...e){ac.logLevel<=se.ERROR&&ac.error(`Auth (${Qs}): ${t}`,...e)}/**
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
 */function tn(t,...e){throw Um(t,...e)}function mn(t,...e){return Um(t,...e)}function Fm(t,e,n){const r=Object.assign(Object.assign({},T2()),{[e]:n});return new Ks("auth","Firebase",r).create(e,{appName:t.name})}function Dn(t){return Fm(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function I2(t,e,n){const r=n;if(!(e instanceof r))throw r.name!==e.constructor.name&&tn(t,"argument-error"),Fm(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Um(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return Hx.create(t,...e)}function K(t,e,...n){if(!t)throw Um(e,...n)}function qn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw vu(e),new Error(e)}function sr(t,e){t||qn(e)}/**
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
 */function lc(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function S2(){return P_()==="http:"||P_()==="https:"}function P_(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
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
 */function A2(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(S2()||Hb()||"connection"in navigator)?navigator.onLine:!0}function k2(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class rl{constructor(e,n){this.shortDelay=e,this.longDelay=n,sr(n>e,"Short delay should be less than long delay!"),this.isMobile=$b()||qb()}get(){return A2()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Bm(t,e){sr(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class qx{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;qn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;qn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;qn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const b2={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const C2=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],N2=new rl(3e4,6e4);function ss(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function lr(t,e,n,r,s={}){return Gx(t,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const l=Qa(Object.assign({key:t.config.apiKey},o)).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const c=Object.assign({method:e,headers:u},i);return Wb()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&or(t.emulatorConfig.host)&&(c.credentials="include"),qx.fetch()(await Kx(t,t.config.apiHost,n,l),c)})}async function Gx(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},b2),e);try{const s=new P2(t),i=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Kl(t,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const l=i.ok?o.errorMessage:o.error.message,[u,c]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Kl(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Kl(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw Kl(t,"user-disabled",o);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw Fm(t,f,c);tn(t,f)}}catch(s){if(s instanceof nn)throw s;tn(t,"network-request-failed",{message:String(s)})}}async function sl(t,e,n,r,s={}){const i=await lr(t,e,n,r,s);return"mfaPendingCredential"in i&&tn(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function Kx(t,e,n,r){const s=`${e}${n}?${r}`,i=t,o=i.config.emulator?Bm(t.config,s):`${t.config.apiScheme}://${s}`;return C2.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function R2(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class P2{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(mn(this.auth,"network-request-failed")),N2.get())})}}function Kl(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=mn(t,e,r);return s.customData._tokenResponse=n,s}function D_(t){return t!==void 0&&t.enterprise!==void 0}class D2{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return R2(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function O2(t,e){return lr(t,"GET","/v2/recaptchaConfig",ss(t,e))}/**
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
 */async function M2(t,e){return lr(t,"POST","/v1/accounts:delete",e)}async function uc(t,e){return lr(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function la(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function j2(t,e=!1){const n=ce(t),r=await n.getIdToken(e),s=$m(r);K(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:la(_h(s.auth_time)),issuedAtTime:la(_h(s.iat)),expirationTime:la(_h(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function _h(t){return Number(t)*1e3}function $m(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return vu("JWT malformed, contained fewer than 3 sections"),null;try{const s=JE(n);return s?JSON.parse(s):(vu("Failed to decode base64 JWT payload"),null)}catch(s){return vu("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function O_(t){const e=$m(t);return K(e,"internal-error"),K(typeof e.exp<"u","internal-error"),K(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Ki(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof nn&&L2(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function L2({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class V2{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Jf{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=la(this.lastLoginAt),this.creationTime=la(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function cc(t){var e;const n=t.auth,r=await t.getIdToken(),s=await Ki(t,uc(n,{idToken:r}));K(s==null?void 0:s.users.length,n,"internal-error");const i=s.users[0];t._notifyReloadListener(i);const o=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?Qx(i.providerUserInfo):[],l=U2(t.providerData,o),u=t.isAnonymous,c=!(t.email&&i.passwordHash)&&!(l!=null&&l.length),f=u?c:!1,m={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:l,metadata:new Jf(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(t,m)}async function F2(t){const e=ce(t);await cc(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function U2(t,e){return[...t.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Qx(t){return t.map(e=>{var{providerId:n}=e,r=Vm(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function B2(t,e){const n=await Gx(t,{},async()=>{const r=Qa({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=t.config,o=await Kx(t,s,"/v1/token",`key=${i}`),l=await t._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:l,body:r};return t.emulatorConfig&&or(t.emulatorConfig.host)&&(u.credentials="include"),qx.fetch()(o,u)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function $2(t,e){return lr(t,"POST","/v2/accounts:revokeToken",ss(t,e))}/**
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
 */class Ri{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){K(e.idToken,"internal-error"),K(typeof e.idToken<"u","internal-error"),K(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):O_(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){K(e.length!==0,"internal-error");const n=O_(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(K(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:s,expiresIn:i}=await B2(e,n);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:s,expirationTime:i}=n,o=new Ri;return r&&(K(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(K(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(K(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Ri,this.toJSON())}_performRefresh(){return qn("not implemented")}}/**
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
 */function pr(t,e){K(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class hn{constructor(e){var{uid:n,auth:r,stsTokenManager:s}=e,i=Vm(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new V2(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Jf(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await Ki(this,this.stsTokenManager.getToken(this.auth,e));return K(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return j2(this,e)}reload(){return F2(this)}_assign(e){this!==e&&(K(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new hn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){K(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await cc(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ht(this.auth.app))return Promise.reject(Dn(this.auth));const e=await this.getIdToken();return await Ki(this,M2(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,s,i,o,l,u,c,f;const m=(r=n.displayName)!==null&&r!==void 0?r:void 0,g=(s=n.email)!==null&&s!==void 0?s:void 0,x=(i=n.phoneNumber)!==null&&i!==void 0?i:void 0,A=(o=n.photoURL)!==null&&o!==void 0?o:void 0,C=(l=n.tenantId)!==null&&l!==void 0?l:void 0,N=(u=n._redirectEventId)!==null&&u!==void 0?u:void 0,E=(c=n.createdAt)!==null&&c!==void 0?c:void 0,y=(f=n.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:_,emailVerified:R,isAnonymous:V,providerData:j,stsTokenManager:I}=n;K(_&&I,e,"internal-error");const w=Ri.fromJSON(this.name,I);K(typeof _=="string",e,"internal-error"),pr(m,e.name),pr(g,e.name),K(typeof R=="boolean",e,"internal-error"),K(typeof V=="boolean",e,"internal-error"),pr(x,e.name),pr(A,e.name),pr(C,e.name),pr(N,e.name),pr(E,e.name),pr(y,e.name);const S=new hn({uid:_,auth:e,email:g,emailVerified:R,displayName:m,isAnonymous:V,photoURL:A,phoneNumber:x,tenantId:C,stsTokenManager:w,createdAt:E,lastLoginAt:y});return j&&Array.isArray(j)&&(S.providerData=j.map(T=>Object.assign({},T))),N&&(S._redirectEventId=N),S}static async _fromIdTokenResponse(e,n,r=!1){const s=new Ri;s.updateFromServerResponse(n);const i=new hn({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await cc(i),i}static async _fromGetAccountInfoResponse(e,n,r){const s=n.users[0];K(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Qx(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),l=new Ri;l.updateFromIdToken(r);const u=new hn({uid:s.localId,auth:e,stsTokenManager:l,isAnonymous:o}),c={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Jf(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(u,c),u}}/**
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
 */const M_=new Map;function Gn(t){sr(t instanceof Function,"Expected a class definition");let e=M_.get(t);return e?(sr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,M_.set(t,e),e)}/**
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
 */class Yx{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Yx.type="NONE";const j_=Yx;/**
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
 */function _u(t,e,n){return`firebase:${t}:${e}:${n}`}class Pi{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=_u(this.userKey,s.apiKey,i),this.fullPersistenceKey=_u("persistence",s.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await uc(this.auth,{idToken:e}).catch(()=>{});return n?hn._fromGetAccountInfoResponse(this.auth,n,e):null}return hn._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Pi(Gn(j_),e,r);const s=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c);let i=s[0]||Gn(j_);const o=_u(r,e.config.apiKey,e.name);let l=null;for(const c of n)try{const f=await c._get(o);if(f){let m;if(typeof f=="string"){const g=await uc(e,{idToken:f}).catch(()=>{});if(!g)break;m=await hn._fromGetAccountInfoResponse(e,g,f)}else m=hn._fromJSON(e,f);c!==i&&(l=m),i=c;break}}catch{}const u=s.filter(c=>c._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new Pi(i,e,r):(i=u[0],l&&await i._set(o,l.toJSON()),await Promise.all(n.map(async c=>{if(c!==i)try{await c._remove(o)}catch{}})),new Pi(i,e,r))}}/**
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
 */function L_(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(eI(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Xx(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(nI(e))return"Blackberry";if(rI(e))return"Webos";if(Jx(e))return"Safari";if((e.includes("chrome/")||Zx(e))&&!e.includes("edge/"))return"Chrome";if(tI(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Xx(t=gt()){return/firefox\//i.test(t)}function Jx(t=gt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Zx(t=gt()){return/crios\//i.test(t)}function eI(t=gt()){return/iemobile/i.test(t)}function tI(t=gt()){return/android/i.test(t)}function nI(t=gt()){return/blackberry/i.test(t)}function rI(t=gt()){return/webos/i.test(t)}function zm(t=gt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function z2(t=gt()){var e;return zm(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function W2(){return Gb()&&document.documentMode===10}function sI(t=gt()){return zm(t)||tI(t)||rI(t)||nI(t)||/windows phone/i.test(t)||eI(t)}/**
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
 */function iI(t,e=[]){let n;switch(t){case"Browser":n=L_(gt());break;case"Worker":n=`${L_(gt())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Qs}/${r}`}/**
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
 */class H2{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=i=>new Promise((o,l)=>{try{const u=e(i);o(u)}catch(u){l(u)}});r.onAbort=n,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function q2(t,e={}){return lr(t,"GET","/v2/passwordPolicy",ss(t,e))}/**
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
 */const G2=6;class K2{constructor(e){var n,r,s,i;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=o.minPasswordLength)!==null&&n!==void 0?n:G2,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,s,i,o,l;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(n=u.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(s=u.containsLowercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(i=u.containsUppercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(l=u.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),u}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class Q2{constructor(e,n,r,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new V_(this),this.idTokenSubscription=new V_(this),this.beforeStateQueue=new H2(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Hx,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Gn(n)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted&&(this.persistenceManager=await Pi.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await uc(this,{idToken:e}),r=await hn._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(ht(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=s==null?void 0:s._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===l)&&(u!=null&&u.user)&&(s=u.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return K(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await cc(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=k2()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(ht(this.app))return Promise.reject(Dn(this));const n=e?ce(e):null;return n&&K(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&K(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return ht(this.app)?Promise.reject(Dn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return ht(this.app)?Promise.reject(Dn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Gn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await q2(this),n=new K2(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Ks("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await $2(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Gn(e)||this._popupRedirectResolver;K(n,this,"argument-error"),this.redirectPersistenceManager=await Pi.create(this,[Gn(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,s){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(K(l,this,"internal-error"),l.then(()=>{o||i(this.currentUser)}),typeof n=="function"){const u=e.addObserver(n,r,s);return()=>{o=!0,u()}}else{const u=e.addObserver(n);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return K(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=iI(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(n["X-Firebase-AppCheck"]=s),n}async _getAppCheckToken(){var e;if(ht(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&x2(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function is(t){return ce(t)}class V_{constructor(e){this.auth=e,this.observer=null,this.addObserver=eC(n=>this.observer=n)}get next(){return K(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let id={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Y2(t){id=t}function oI(t){return id.loadJS(t)}function X2(){return id.recaptchaEnterpriseScript}function J2(){return id.gapiScript}function Z2(t){return`__${t}${Math.floor(Math.random()*1e6)}`}class eD{constructor(){this.enterprise=new tD}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class tD{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const nD="recaptcha-enterprise",aI="NO_RECAPTCHA";class rD{constructor(e){this.type=nD,this.auth=is(e)}async verify(e="verify",n=!1){async function r(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,l)=>{O2(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{const c=new D2(u);return i.tenantId==null?i._agentRecaptchaConfig=c:i._tenantRecaptchaConfigs[i.tenantId]=c,o(c.siteKey)}}).catch(u=>{l(u)})})}function s(i,o,l){const u=window.grecaptcha;D_(u)?u.enterprise.ready(()=>{u.enterprise.execute(i,{action:e}).then(c=>{o(c)}).catch(()=>{o(aI)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new eD().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{r(this.auth).then(l=>{if(!n&&D_(window.grecaptcha))s(l,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=X2();u.length!==0&&(u+=l),oI(u).then(()=>{s(l,i,o)}).catch(c=>{o(c)})}}).catch(l=>{o(l)})})}}async function F_(t,e,n,r=!1,s=!1){const i=new rD(t);let o;if(s)o=aI;else try{o=await i.verify(n)}catch{o=await i.verify(n,!0)}const l=Object.assign({},e);if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in l){const u=l.phoneEnrollmentInfo.phoneNumber,c=l.phoneEnrollmentInfo.recaptchaToken;Object.assign(l,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in l){const u=l.phoneSignInInfo.recaptchaToken;Object.assign(l,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return l}return r?Object.assign(l,{captchaResp:o}):Object.assign(l,{captchaResponse:o}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function Zf(t,e,n,r,s){var i;if(!((i=t._getRecaptchaConfig())===null||i===void 0)&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await F_(t,e,n,n==="getOobCode");return r(t,o)}else return r(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const l=await F_(t,e,n,n==="getOobCode");return r(t,l)}else return Promise.reject(o)})}/**
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
 */function sD(t,e){const n=ts(t,"auth");if(n.isInitialized()){const s=n.getImmediate(),i=n.getOptions();if(Ms(i,e??{}))return s;tn(s,"already-initialized")}return n.initialize({options:e})}function iD(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(Gn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function oD(t,e,n){const r=is(t);K(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=lI(e),{host:o,port:l}=aD(e),u=l===null?"":`:${l}`,c={url:`${i}//${o}${u}/`},f=Object.freeze({host:o,port:l,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){K(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),K(Ms(c,r.config.emulator)&&Ms(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=c,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,or(o)?(Vc(`${i}//${o}${u}`),Fc("Auth",!0)):lD()}function lI(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function aD(t){const e=lI(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:U_(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:U_(o)}}}function U_(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function lD(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class Wm{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return qn("not implemented")}_getIdTokenResponse(e){return qn("not implemented")}_linkToIdToken(e,n){return qn("not implemented")}_getReauthenticationResolver(e){return qn("not implemented")}}async function uD(t,e){return lr(t,"POST","/v1/accounts:signUp",e)}/**
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
 */async function cD(t,e){return sl(t,"POST","/v1/accounts:signInWithPassword",ss(t,e))}/**
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
 */async function dD(t,e){return sl(t,"POST","/v1/accounts:signInWithEmailLink",ss(t,e))}async function hD(t,e){return sl(t,"POST","/v1/accounts:signInWithEmailLink",ss(t,e))}/**
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
 */class Fa extends Wm{constructor(e,n,r,s=null){super("password",r),this._email=e,this._password=n,this._tenantId=s}static _fromEmailAndPassword(e,n){return new Fa(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new Fa(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Zf(e,n,"signInWithPassword",cD);case"emailLink":return dD(e,{email:this._email,oobCode:this._password});default:tn(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Zf(e,r,"signUpPassword",uD);case"emailLink":return hD(e,{idToken:n,email:this._email,oobCode:this._password});default:tn(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function Di(t,e){return sl(t,"POST","/v1/accounts:signInWithIdp",ss(t,e))}/**
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
 */const fD="http://localhost";class Fs extends Wm{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new Fs(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):tn("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=n,i=Vm(n,["providerId","signInMethod"]);if(!r||!s)return null;const o=new Fs(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Di(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Di(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Di(e,n)}buildRequest(){const e={requestUri:fD,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Qa(n)}return e}}/**
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
 */function pD(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function mD(t){const e=Bo($o(t)).link,n=e?Bo($o(e)).deep_link_id:null,r=Bo($o(t)).deep_link_id;return(r?Bo($o(r)).link:null)||r||n||e||t}class od{constructor(e){var n,r,s,i,o,l;const u=Bo($o(e)),c=(n=u.apiKey)!==null&&n!==void 0?n:null,f=(r=u.oobCode)!==null&&r!==void 0?r:null,m=pD((s=u.mode)!==null&&s!==void 0?s:null);K(c&&f&&m,"argument-error"),this.apiKey=c,this.operation=m,this.code=f,this.continueUrl=(i=u.continueUrl)!==null&&i!==void 0?i:null,this.languageCode=(o=u.lang)!==null&&o!==void 0?o:null,this.tenantId=(l=u.tenantId)!==null&&l!==void 0?l:null}static parseLink(e){const n=mD(e);try{return new od(n)}catch{return null}}}/**
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
 */class Js{constructor(){this.providerId=Js.PROVIDER_ID}static credential(e,n){return Fa._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=od.parseLink(n);return K(r,"argument-error"),Fa._fromEmailAndCode(e,r.code,r.tenantId)}}Js.PROVIDER_ID="password";Js.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Js.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class Hm{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class il extends Hm{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class Er extends il{constructor(){super("facebook.com")}static credential(e){return Fs._fromParams({providerId:Er.PROVIDER_ID,signInMethod:Er.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Er.credentialFromTaggedObject(e)}static credentialFromError(e){return Er.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Er.credential(e.oauthAccessToken)}catch{return null}}}Er.FACEBOOK_SIGN_IN_METHOD="facebook.com";Er.PROVIDER_ID="facebook.com";/**
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
 */class $n extends il{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Fs._fromParams({providerId:$n.PROVIDER_ID,signInMethod:$n.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return $n.credentialFromTaggedObject(e)}static credentialFromError(e){return $n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return $n.credential(n,r)}catch{return null}}}$n.GOOGLE_SIGN_IN_METHOD="google.com";$n.PROVIDER_ID="google.com";/**
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
 */class Tr extends il{constructor(){super("github.com")}static credential(e){return Fs._fromParams({providerId:Tr.PROVIDER_ID,signInMethod:Tr.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Tr.credentialFromTaggedObject(e)}static credentialFromError(e){return Tr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Tr.credential(e.oauthAccessToken)}catch{return null}}}Tr.GITHUB_SIGN_IN_METHOD="github.com";Tr.PROVIDER_ID="github.com";/**
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
 */class xr extends il{constructor(){super("twitter.com")}static credential(e,n){return Fs._fromParams({providerId:xr.PROVIDER_ID,signInMethod:xr.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return xr.credentialFromTaggedObject(e)}static credentialFromError(e){return xr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return xr.credential(n,r)}catch{return null}}}xr.TWITTER_SIGN_IN_METHOD="twitter.com";xr.PROVIDER_ID="twitter.com";/**
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
 */async function gD(t,e){return sl(t,"POST","/v1/accounts:signUp",ss(t,e))}/**
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
 */class Us{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,s=!1){const i=await hn._fromIdTokenResponse(e,r,s),o=B_(r);return new Us({user:i,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const s=B_(r);return new Us({user:e,providerId:s,_tokenResponse:r,operationType:n})}}function B_(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class dc extends nn{constructor(e,n,r,s){var i;super(n.code,n.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,dc.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,s){return new dc(e,n,r,s)}}function uI(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?dc._fromErrorAndOperation(t,i,e,r):i})}async function yD(t,e,n=!1){const r=await Ki(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Us._forOperation(t,"link",r)}/**
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
 */async function vD(t,e,n=!1){const{auth:r}=t;if(ht(r.app))return Promise.reject(Dn(r));const s="reauthenticate";try{const i=await Ki(t,uI(r,s,e,t),n);K(i.idToken,r,"internal-error");const o=$m(i.idToken);K(o,r,"internal-error");const{sub:l}=o;return K(t.uid===l,r,"user-mismatch"),Us._forOperation(t,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&tn(r,"user-mismatch"),i}}/**
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
 */async function cI(t,e,n=!1){if(ht(t.app))return Promise.reject(Dn(t));const r="signIn",s=await uI(t,r,e),i=await Us._fromIdTokenResponse(t,r,s);return n||await t._updateCurrentUser(i.user),i}async function dI(t,e){return cI(is(t),e)}/**
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
 */async function hI(t){const e=is(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function _D(t,e,n){if(ht(t.app))return Promise.reject(Dn(t));const r=is(t),o=await Zf(r,{returnSecureToken:!0,email:e,password:n,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",gD).catch(u=>{throw u.code==="auth/password-does-not-meet-requirements"&&hI(t),u}),l=await Us._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(l.user),l}function wD(t,e,n){return ht(t.app)?Promise.reject(Dn(t)):dI(ce(t),Js.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&hI(t),r})}function ED(t,e){const n=od.parseLink(e);return(n==null?void 0:n.operation)==="EMAIL_SIGNIN"}async function TD(t,e,n){if(ht(t.app))return Promise.reject(Dn(t));const r=ce(t),s=Js.credentialWithLink(e,n||lc());return K(s._tenantId===(r.tenantId||null),r,"tenant-id-mismatch"),dI(r,s)}/**
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
 */async function xD(t,e){return lr(t,"POST","/v1/accounts:update",e)}/**
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
 */async function ID(t,{displayName:e,photoURL:n}){if(e===void 0&&n===void 0)return;const r=ce(t),i={idToken:await r.getIdToken(),displayName:e,photoUrl:n,returnSecureToken:!0},o=await Ki(r,xD(r.auth,i));r.displayName=o.displayName||null,r.photoURL=o.photoUrl||null;const l=r.providerData.find(({providerId:u})=>u==="password");l&&(l.displayName=r.displayName,l.photoURL=r.photoURL),await r._updateTokensIfNecessary(o)}/**
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
 */function SD(t,e){return ce(t).setPersistence(e)}function AD(t,e,n,r){return ce(t).onIdTokenChanged(e,n,r)}function kD(t,e,n){return ce(t).beforeAuthStateChanged(e,n)}function ol(t,e,n,r){return ce(t).onAuthStateChanged(e,n,r)}function bD(t){return ce(t).signOut()}const hc="__sak";/**
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
 */class fI{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(hc,"1"),this.storage.removeItem(hc),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const CD=1e3,ND=10;class pI extends fI{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=sI(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),s=this.localCache[n];r!==s&&e(n,s,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,u)=>{this.notifyListeners(o,u)});return}const r=e.key;n?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);W2()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,ND):s()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},CD)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}pI.type="LOCAL";const mI=pI;/**
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
 */class gI extends fI{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}gI.type="SESSION";const yI=gI;/**
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
 */function RD(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class ad{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(s=>s.isListeningto(e));if(n)return n;const r=new ad(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:s,data:i}=n.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const l=Array.from(o).map(async c=>c(n.origin,i)),u=await RD(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ad.receivers=[];/**
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
 */function qm(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class PD{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((l,u)=>{const c=qm("",20);s.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(m){const g=m;if(g.data.eventId===c)switch(g.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),l(g.data.response);break;default:clearTimeout(f),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function On(){return window}function DD(t){On().location.href=t}/**
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
 */function vI(){return typeof On().WorkerGlobalScope<"u"&&typeof On().importScripts=="function"}async function OD(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function MD(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function jD(){return vI()?self:null}/**
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
 */const _I="firebaseLocalStorageDb",LD=1,fc="firebaseLocalStorage",wI="fbase_key";class al{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function ld(t,e){return t.transaction([fc],e?"readwrite":"readonly").objectStore(fc)}function VD(){const t=indexedDB.deleteDatabase(_I);return new al(t).toPromise()}function ep(){const t=indexedDB.open(_I,LD);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(fc,{keyPath:wI})}catch(s){n(s)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(fc)?e(r):(r.close(),await VD(),e(await ep()))})})}async function $_(t,e,n){const r=ld(t,!0).put({[wI]:e,value:n});return new al(r).toPromise()}async function FD(t,e){const n=ld(t,!1).get(e),r=await new al(n).toPromise();return r===void 0?null:r.value}function z_(t,e){const n=ld(t,!0).delete(e);return new al(n).toPromise()}const UD=800,BD=3;class EI{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await ep(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>BD)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return vI()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ad._getInstance(jD()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await OD(),!this.activeServiceWorker)return;this.sender=new PD(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||MD()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await ep();return await $_(e,hc,"1"),await z_(e,hc),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>$_(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>FD(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>z_(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=ld(s,!1).getAll();return new al(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),n.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),n.push(s));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),UD)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}EI.type="LOCAL";const $D=EI;new rl(3e4,6e4);/**
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
 */function TI(t,e){return e?Gn(e):(K(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Gm extends Wm{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Di(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Di(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Di(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function zD(t){return cI(t.auth,new Gm(t),t.bypassAuthState)}function WD(t){const{auth:e,user:n}=t;return K(n,e,"internal-error"),vD(n,new Gm(t),t.bypassAuthState)}async function HD(t){const{auth:e,user:n}=t;return K(n,e,"internal-error"),yD(n,new Gm(t),t.bypassAuthState)}/**
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
 */class xI{constructor(e,n,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:s,tenantId:i,error:o,type:l}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:n,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return zD;case"linkViaPopup":case"linkViaRedirect":return HD;case"reauthViaPopup":case"reauthViaRedirect":return WD;default:tn(this.auth,"internal-error")}}resolve(e){sr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){sr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const qD=new rl(2e3,1e4);async function GD(t,e,n){if(ht(t.app))return Promise.reject(mn(t,"operation-not-supported-in-this-environment"));const r=is(t);I2(t,e,Hm);const s=TI(r,n);return new Ts(r,"signInViaPopup",e,s).executeNotNull()}class Ts extends xI{constructor(e,n,r,s,i){super(e,n,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Ts.currentPopupAction&&Ts.currentPopupAction.cancel(),Ts.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return K(e,this.auth,"internal-error"),e}async onExecution(){sr(this.filter.length===1,"Popup operations only handle one event");const e=qm();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(mn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(mn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Ts.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(mn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,qD.get())};e()}}Ts.currentPopupAction=null;/**
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
 */const KD="pendingRedirect",wu=new Map;class QD extends xI{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=wu.get(this.auth._key());if(!e){try{const r=await YD(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}wu.set(this.auth._key(),e)}return this.bypassAuthState||wu.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function YD(t,e){const n=ZD(e),r=JD(t);if(!await r._isAvailable())return!1;const s=await r._get(n)==="true";return await r._remove(n),s}function XD(t,e){wu.set(t._key(),e)}function JD(t){return Gn(t._redirectPersistence)}function ZD(t){return _u(KD,t.config.apiKey,t.name)}async function eO(t,e,n=!1){if(ht(t.app))return Promise.reject(Dn(t));const r=is(t),s=TI(r,e),o=await new QD(r,s,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
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
 */const tO=10*60*1e3;class nO{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!rO(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!II(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(mn(this.auth,s))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=tO&&this.cachedEventUids.clear(),this.cachedEventUids.has(W_(e))}saveEventToCache(e){this.cachedEventUids.add(W_(e)),this.lastProcessedEventTime=Date.now()}}function W_(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function II({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function rO(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return II(t);default:return!1}}/**
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
 */async function sO(t,e={}){return lr(t,"GET","/v1/projects",e)}/**
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
 */const iO=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,oO=/^https?/;async function aO(t){if(t.config.emulator)return;const{authorizedDomains:e}=await sO(t);for(const n of e)try{if(lO(n))return}catch{}tn(t,"unauthorized-domain")}function lO(t){const e=lc(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!oO.test(n))return!1;if(iO.test(t))return r===t;const s=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const uO=new rl(3e4,6e4);function H_(){const t=On().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function cO(t){return new Promise((e,n)=>{var r,s,i;function o(){H_(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{H_(),n(mn(t,"network-request-failed"))},timeout:uO.get()})}if(!((s=(r=On().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=On().gapi)===null||i===void 0)&&i.load)o();else{const l=Z2("iframefcb");return On()[l]=()=>{gapi.load?o():n(mn(t,"network-request-failed"))},oI(`${J2()}?onload=${l}`).catch(u=>n(u))}}).catch(e=>{throw Eu=null,e})}let Eu=null;function dO(t){return Eu=Eu||cO(t),Eu}/**
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
 */const hO=new rl(5e3,15e3),fO="__/auth/iframe",pO="emulator/auth/iframe",mO={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},gO=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function yO(t){const e=t.config;K(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Bm(e,pO):`https://${t.config.authDomain}/${fO}`,r={apiKey:e.apiKey,appName:t.name,v:Qs},s=gO.get(t.config.apiHost);s&&(r.eid=s);const i=t._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${Qa(r).slice(1)}`}async function vO(t){const e=await dO(t),n=On().gapi;return K(n,t,"internal-error"),e.open({where:document.body,url:yO(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:mO,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=mn(t,"network-request-failed"),l=On().setTimeout(()=>{i(o)},hO.get());function u(){On().clearTimeout(l),s(r)}r.ping(u).then(u,()=>{i(o)})}))}/**
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
 */const _O={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},wO=500,EO=600,TO="_blank",xO="http://localhost";class q_{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function IO(t,e,n,r=wO,s=EO){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const u=Object.assign(Object.assign({},_O),{width:r.toString(),height:s.toString(),top:i,left:o}),c=gt().toLowerCase();n&&(l=Zx(c)?TO:n),Xx(c)&&(e=e||xO,u.scrollbars="yes");const f=Object.entries(u).reduce((g,[x,A])=>`${g}${x}=${A},`,"");if(z2(c)&&l!=="_self")return SO(e||"",l),new q_(null);const m=window.open(e||"",l,f);K(m,t,"popup-blocked");try{m.focus()}catch{}return new q_(m)}function SO(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const AO="__/auth/handler",kO="emulator/auth/handler",bO=encodeURIComponent("fac");async function G_(t,e,n,r,s,i){K(t.config.authDomain,t,"auth-domain-config-required"),K(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:Qs,eventId:s};if(e instanceof Hm){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Zb(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries({}))o[f]=m}if(e instanceof il){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(o.scopes=f.join(","))}t.tenantId&&(o.tid=t.tenantId);const l=o;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const u=await t._getAppCheckToken(),c=u?`#${bO}=${encodeURIComponent(u)}`:"";return`${CO(t)}?${Qa(l).slice(1)}${c}`}function CO({config:t}){return t.emulator?Bm(t,kO):`https://${t.authDomain}/${AO}`}/**
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
 */const wh="webStorageSupport";class NO{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=yI,this._completeRedirectFn=eO,this._overrideRedirectResult=XD}async _openPopup(e,n,r,s){var i;sr((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const o=await G_(e,n,r,lc(),s);return IO(e,o,qm())}async _openRedirect(e,n,r,s){await this._originValidation(e);const i=await G_(e,n,r,lc(),s);return DD(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:s,promise:i}=this.eventManagers[n];return s?Promise.resolve(s):(sr(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await vO(e),r=new nO(e);return n.register("authEvent",s=>(K(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(wh,{type:wh},s=>{var i;const o=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[wh];o!==void 0&&n(!!o),tn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=aO(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return sI()||Jx()||zm()}}const RO=NO;var K_="@firebase/auth",Q_="1.10.8";/**
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
 */class PO{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){K(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function DO(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function OO(t){en(new zt("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;K(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:iI(t)},c=new Q2(r,s,i,u);return iD(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),en(new zt("auth-internal",e=>{const n=is(e.getProvider("auth").getImmediate());return(r=>new PO(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),ft(K_,Q_,DO(t)),ft(K_,Q_,"esm2017")}/**
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
 */const MO=5*60,jO=tT("authIdTokenMaxAge")||MO;let Y_=null;const LO=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>jO)return;const s=n==null?void 0:n.token;Y_!==s&&(Y_=s,await fetch(t,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function ur(t=Ya()){const e=ts(t,"auth");if(e.isInitialized())return e.getImmediate();const n=sD(t,{popupRedirectResolver:RO,persistence:[$D,mI,yI]}),r=tT("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=LO(i.toString());kD(n,o,()=>o(n.currentUser)),AD(n,l=>o(l))}}const s=ZE("auth");return s&&oD(n,`http://${s}`),n}function VO(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}Y2({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=s=>{const i=mn("internal-error");i.customData=s,n(i)},r.type="text/javascript",r.charset="UTF-8",VO().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});OO("Browser");/**
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
 */const FO="type.googleapis.com/google.protobuf.Int64Value",UO="type.googleapis.com/google.protobuf.UInt64Value";function SI(t,e){const n={};for(const r in t)t.hasOwnProperty(r)&&(n[r]=e(t[r]));return n}function pc(t){if(t==null)return null;if(t instanceof Number&&(t=t.valueOf()),typeof t=="number"&&isFinite(t)||t===!0||t===!1||Object.prototype.toString.call(t)==="[object String]")return t;if(t instanceof Date)return t.toISOString();if(Array.isArray(t))return t.map(e=>pc(e));if(typeof t=="function"||typeof t=="object")return SI(t,e=>pc(e));throw new Error("Data cannot be encoded in JSON: "+t)}function Qi(t){if(t==null)return t;if(t["@type"])switch(t["@type"]){case FO:case UO:{const e=Number(t.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+t);return e}default:throw new Error("Data cannot be decoded from JSON: "+t)}return Array.isArray(t)?t.map(e=>Qi(e)):typeof t=="function"||typeof t=="object"?SI(t,e=>Qi(e)):t}/**
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
 */const Km="functions";/**
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
 */const X_={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Pt extends nn{constructor(e,n,r){super(`${Km}/${e}`,n||""),this.details=r,Object.setPrototypeOf(this,Pt.prototype)}}function BO(t){if(t>=200&&t<300)return"ok";switch(t){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function mc(t,e){let n=BO(t),r=n,s;try{const i=e&&e.error;if(i){const o=i.status;if(typeof o=="string"){if(!X_[o])return new Pt("internal","internal");n=X_[o],r=o}const l=i.message;typeof l=="string"&&(r=l),s=i.details,s!==void 0&&(s=Qi(s))}}catch{}return n==="ok"?null:new Pt(n,r,s)}/**
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
 */class $O{constructor(e,n,r,s){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,ht(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=n.getImmediate({optional:!0}),this.messaging=r.getImmediate({optional:!0}),this.auth||n.get().then(i=>this.auth=i,()=>{}),this.messaging||r.get().then(i=>this.messaging=i,()=>{}),this.appCheck||s==null||s.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const n=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return n.error?null:n.token}return null}async getContext(e){const n=await this.getAuthToken(),r=await this.getMessagingToken(),s=await this.getAppCheckToken(e);return{authToken:n,messagingToken:r,appCheckToken:s}}}/**
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
 */const tp="us-central1",zO=/^data: (.*?)(?:\n|$)/;function WO(t){let e=null;return{promise:new Promise((n,r)=>{e=setTimeout(()=>{r(new Pt("deadline-exceeded","deadline-exceeded"))},t)}),cancel:()=>{e&&clearTimeout(e)}}}class HO{constructor(e,n,r,s,i=tp,o=(...l)=>fetch(...l)){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new $O(e,n,r,s),this.cancelAllRequests=new Promise(l=>{this.deleteService=()=>Promise.resolve(l())});try{const l=new URL(i);this.customDomain=l.origin+(l.pathname==="/"?"":l.pathname),this.region=tp}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(e){const n=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${n}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${n}.cloudfunctions.net/${e}`}}function qO(t,e,n){const r=or(e);t.emulatorOrigin=`http${r?"s":""}://${e}:${n}`,r&&(Vc(t.emulatorOrigin),Fc("Functions",!0))}function GO(t,e,n){const r=s=>QO(t,e,s,{});return r.stream=(s,i)=>XO(t,e,s,i),r}async function KO(t,e,n,r){n["Content-Type"]="application/json";let s;try{s=await r(t,{method:"POST",body:JSON.stringify(e),headers:n})}catch{return{status:0,json:null}}let i=null;try{i=await s.json()}catch{}return{status:s.status,json:i}}async function AI(t,e){const n={},r=await t.contextProvider.getContext(e.limitedUseAppCheckTokens);return r.authToken&&(n.Authorization="Bearer "+r.authToken),r.messagingToken&&(n["Firebase-Instance-ID-Token"]=r.messagingToken),r.appCheckToken!==null&&(n["X-Firebase-AppCheck"]=r.appCheckToken),n}function QO(t,e,n,r){const s=t._url(e);return YO(t,s,n,r)}async function YO(t,e,n,r){n=pc(n);const s={data:n},i=await AI(t,r),o=r.timeout||7e4,l=WO(o),u=await Promise.race([KO(e,s,i,t.fetchImpl),l.promise,t.cancelAllRequests]);if(l.cancel(),!u)throw new Pt("cancelled","Firebase Functions instance was deleted.");const c=mc(u.status,u.json);if(c)throw c;if(!u.json)throw new Pt("internal","Response is not valid JSON object.");let f=u.json.data;if(typeof f>"u"&&(f=u.json.result),typeof f>"u")throw new Pt("internal","Response is missing data field.");return{data:Qi(f)}}function XO(t,e,n,r){const s=t._url(e);return JO(t,s,n,r||{})}async function JO(t,e,n,r){var s;n=pc(n);const i={data:n},o=await AI(t,r);o["Content-Type"]="application/json",o.Accept="text/event-stream";let l;try{l=await t.fetchImpl(e,{method:"POST",body:JSON.stringify(i),headers:o,signal:r==null?void 0:r.signal})}catch(x){if(x instanceof Error&&x.name==="AbortError"){const C=new Pt("cancelled","Request was cancelled.");return{data:Promise.reject(C),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(C)}}}}}}const A=mc(0,null);return{data:Promise.reject(A),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(A)}}}}}}let u,c;const f=new Promise((x,A)=>{u=x,c=A});(s=r==null?void 0:r.signal)===null||s===void 0||s.addEventListener("abort",()=>{const x=new Pt("cancelled","Request was cancelled.");c(x)});const m=l.body.getReader(),g=ZO(m,u,c,r==null?void 0:r.signal);return{stream:{[Symbol.asyncIterator](){const x=g.getReader();return{async next(){const{value:A,done:C}=await x.read();return{value:A,done:C}},async return(){return await x.cancel(),{done:!0,value:void 0}}}}},data:f}}function ZO(t,e,n,r){const s=(o,l)=>{const u=o.match(zO);if(!u)return;const c=u[1];try{const f=JSON.parse(c);if("result"in f){e(Qi(f.result));return}if("message"in f){l.enqueue(Qi(f.message));return}if("error"in f){const m=mc(0,f);l.error(m),n(m);return}}catch(f){if(f instanceof Pt){l.error(f),n(f);return}}},i=new TextDecoder;return new ReadableStream({start(o){let l="";return u();async function u(){if(r!=null&&r.aborted){const c=new Pt("cancelled","Request was cancelled");return o.error(c),n(c),Promise.resolve()}try{const{value:c,done:f}=await t.read();if(f){l.trim()&&s(l.trim(),o),o.close();return}if(r!=null&&r.aborted){const g=new Pt("cancelled","Request was cancelled");o.error(g),n(g),await t.cancel();return}l+=i.decode(c,{stream:!0});const m=l.split(`
`);l=m.pop()||"";for(const g of m)g.trim()&&s(g.trim(),o);return u()}catch(c){const f=c instanceof Pt?c:mc(0,null);o.error(f),n(f)}}},cancel(){return t.cancel()}})}const J_="@firebase/functions",Z_="0.12.9";/**
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
 */const e4="auth-internal",t4="app-check-internal",n4="messaging-internal";function r4(t){const e=(n,{instanceIdentifier:r})=>{const s=n.getProvider("app").getImmediate(),i=n.getProvider(e4),o=n.getProvider(n4),l=n.getProvider(t4);return new HO(s,i,o,l,r)};en(new zt(Km,e,"PUBLIC").setMultipleInstances(!0)),ft(J_,Z_,t),ft(J_,Z_,"esm2017")}/**
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
 */function ud(t=Ya(),e=tp){const r=ts(ce(t),Km).getImmediate({identifier:e}),s=Jp("functions");return s&&s4(r,...s),r}function s4(t,e,n){qO(ce(t),e,n)}function ao(t,e,n){return GO(ce(t),e)}r4();const kI="@firebase/installations",Qm="0.6.18";/**
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
 */const bI=1e4,CI=`w:${Qm}`,NI="FIS_v2",i4="https://firebaseinstallations.googleapis.com/v1",o4=60*60*1e3,a4="installations",l4="Installations";/**
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
 */const u4={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},Bs=new Ks(a4,l4,u4);function RI(t){return t instanceof nn&&t.code.includes("request-failed")}/**
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
 */function PI({projectId:t}){return`${i4}/projects/${t}/installations`}function DI(t){return{token:t.token,requestStatus:2,expiresIn:d4(t.expiresIn),creationTime:Date.now()}}async function OI(t,e){const r=(await e.json()).error;return Bs.create("request-failed",{requestName:t,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function MI({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function c4(t,{refreshToken:e}){const n=MI(t);return n.append("Authorization",h4(e)),n}async function jI(t){const e=await t();return e.status>=500&&e.status<600?t():e}function d4(t){return Number(t.replace("s","000"))}function h4(t){return`${NI} ${t}`}/**
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
 */async function f4({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const r=PI(t),s=MI(t),i=e.getImmediate({optional:!0});if(i){const c=await i.getHeartbeatsHeader();c&&s.append("x-firebase-client",c)}const o={fid:n,authVersion:NI,appId:t.appId,sdkVersion:CI},l={method:"POST",headers:s,body:JSON.stringify(o)},u=await jI(()=>fetch(r,l));if(u.ok){const c=await u.json();return{fid:c.fid||n,registrationStatus:2,refreshToken:c.refreshToken,authToken:DI(c.authToken)}}else throw await OI("Create Installation",u)}/**
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
 */function LI(t){return new Promise(e=>{setTimeout(e,t)})}/**
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
 */function p4(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
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
 */const m4=/^[cdef][\w-]{21}$/,np="";function g4(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const n=y4(t);return m4.test(n)?n:np}catch{return np}}function y4(t){return p4(t).substr(0,22)}/**
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
 */function cd(t){return`${t.appName}!${t.appId}`}/**
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
 */const VI=new Map;function FI(t,e){const n=cd(t);UI(n,e),v4(n,e)}function UI(t,e){const n=VI.get(t);if(n)for(const r of n)r(e)}function v4(t,e){const n=_4();n&&n.postMessage({key:t,fid:e}),w4()}let xs=null;function _4(){return!xs&&"BroadcastChannel"in self&&(xs=new BroadcastChannel("[Firebase] FID Change"),xs.onmessage=t=>{UI(t.data.key,t.data.fid)}),xs}function w4(){VI.size===0&&xs&&(xs.close(),xs=null)}/**
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
 */const E4="firebase-installations-database",T4=1,$s="firebase-installations-store";let Eh=null;function Ym(){return Eh||(Eh=Uc(E4,T4,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore($s)}}})),Eh}async function gc(t,e){const n=cd(t),s=(await Ym()).transaction($s,"readwrite"),i=s.objectStore($s),o=await i.get(n);return await i.put(e,n),await s.done,(!o||o.fid!==e.fid)&&FI(t,e.fid),e}async function BI(t){const e=cd(t),r=(await Ym()).transaction($s,"readwrite");await r.objectStore($s).delete(e),await r.done}async function dd(t,e){const n=cd(t),s=(await Ym()).transaction($s,"readwrite"),i=s.objectStore($s),o=await i.get(n),l=e(o);return l===void 0?await i.delete(n):await i.put(l,n),await s.done,l&&(!o||o.fid!==l.fid)&&FI(t,l.fid),l}/**
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
 */async function Xm(t){let e;const n=await dd(t.appConfig,r=>{const s=x4(r),i=I4(t,s);return e=i.registrationPromise,i.installationEntry});return n.fid===np?{installationEntry:await e}:{installationEntry:n,registrationPromise:e}}function x4(t){const e=t||{fid:g4(),registrationStatus:0};return $I(e)}function I4(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(Bs.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=S4(t,n);return{installationEntry:n,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:A4(t)}:{installationEntry:e}}async function S4(t,e){try{const n=await f4(t,e);return gc(t.appConfig,n)}catch(n){throw RI(n)&&n.customData.serverCode===409?await BI(t.appConfig):await gc(t.appConfig,{fid:e.fid,registrationStatus:0}),n}}async function A4(t){let e=await e0(t.appConfig);for(;e.registrationStatus===1;)await LI(100),e=await e0(t.appConfig);if(e.registrationStatus===0){const{installationEntry:n,registrationPromise:r}=await Xm(t);return r||n}return e}function e0(t){return dd(t,e=>{if(!e)throw Bs.create("installation-not-found");return $I(e)})}function $I(t){return k4(t)?{fid:t.fid,registrationStatus:0}:t}function k4(t){return t.registrationStatus===1&&t.registrationTime+bI<Date.now()}/**
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
 */async function b4({appConfig:t,heartbeatServiceProvider:e},n){const r=C4(t,n),s=c4(t,n),i=e.getImmediate({optional:!0});if(i){const c=await i.getHeartbeatsHeader();c&&s.append("x-firebase-client",c)}const o={installation:{sdkVersion:CI,appId:t.appId}},l={method:"POST",headers:s,body:JSON.stringify(o)},u=await jI(()=>fetch(r,l));if(u.ok){const c=await u.json();return DI(c)}else throw await OI("Generate Auth Token",u)}function C4(t,{fid:e}){return`${PI(t)}/${e}/authTokens:generate`}/**
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
 */async function Jm(t,e=!1){let n;const r=await dd(t.appConfig,i=>{if(!zI(i))throw Bs.create("not-registered");const o=i.authToken;if(!e&&P4(o))return i;if(o.requestStatus===1)return n=N4(t,e),i;{if(!navigator.onLine)throw Bs.create("app-offline");const l=O4(i);return n=R4(t,l),l}});return n?await n:r.authToken}async function N4(t,e){let n=await t0(t.appConfig);for(;n.authToken.requestStatus===1;)await LI(100),n=await t0(t.appConfig);const r=n.authToken;return r.requestStatus===0?Jm(t,e):r}function t0(t){return dd(t,e=>{if(!zI(e))throw Bs.create("not-registered");const n=e.authToken;return M4(n)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function R4(t,e){try{const n=await b4(t,e),r=Object.assign(Object.assign({},e),{authToken:n});return await gc(t.appConfig,r),n}catch(n){if(RI(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await BI(t.appConfig);else{const r=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await gc(t.appConfig,r)}throw n}}function zI(t){return t!==void 0&&t.registrationStatus===2}function P4(t){return t.requestStatus===2&&!D4(t)}function D4(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+o4}function O4(t){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},t),{authToken:e})}function M4(t){return t.requestStatus===1&&t.requestTime+bI<Date.now()}/**
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
 */async function j4(t){const e=t,{installationEntry:n,registrationPromise:r}=await Xm(e);return r?r.catch(console.error):Jm(e).catch(console.error),n.fid}/**
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
 */async function L4(t,e=!1){const n=t;return await V4(n),(await Jm(n,e)).token}async function V4(t){const{registrationPromise:e}=await Xm(t);e&&await e}/**
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
 */function F4(t){if(!t||!t.options)throw Th("App Configuration");if(!t.name)throw Th("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw Th(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function Th(t){return Bs.create("missing-app-config-values",{valueName:t})}/**
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
 */const WI="installations",U4="installations-internal",B4=t=>{const e=t.getProvider("app").getImmediate(),n=F4(e),r=ts(e,"heartbeat");return{app:e,appConfig:n,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},$4=t=>{const e=t.getProvider("app").getImmediate(),n=ts(e,WI).getImmediate();return{getId:()=>j4(n),getToken:s=>L4(n,s)}};function z4(){en(new zt(WI,B4,"PUBLIC")),en(new zt(U4,$4,"PRIVATE"))}z4();ft(kI,Qm);ft(kI,Qm,"esm2017");/**
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
 */const W4="/firebase-messaging-sw.js",H4="/firebase-cloud-messaging-push-scope",HI="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",q4="https://fcmregistrations.googleapis.com/v1",qI="google.c.a.c_id",G4="google.c.a.c_l",K4="google.c.a.ts",Q4="google.c.a.e",n0=1e4;var r0;(function(t){t[t.DATA_MESSAGE=1]="DATA_MESSAGE",t[t.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(r0||(r0={}));/**
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
 */var Ua;(function(t){t.PUSH_RECEIVED="push-received",t.NOTIFICATION_CLICKED="notification-clicked"})(Ua||(Ua={}));/**
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
 */function Un(t){const e=new Uint8Array(t);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function Y4(t){const e="=".repeat((4-t.length%4)%4),n=(t+e).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(n),s=new Uint8Array(r.length);for(let i=0;i<r.length;++i)s[i]=r.charCodeAt(i);return s}/**
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
 */const xh="fcm_token_details_db",X4=5,s0="fcm_token_object_Store";async function J4(t){if("databases"in indexedDB&&!(await indexedDB.databases()).map(i=>i.name).includes(xh))return null;let e=null;return(await Uc(xh,X4,{upgrade:async(r,s,i,o)=>{var l;if(s<2||!r.objectStoreNames.contains(s0))return;const u=o.objectStore(s0),c=await u.index("fcmSenderId").get(t);if(await u.clear(),!!c){if(s===2){const f=c;if(!f.auth||!f.p256dh||!f.endpoint)return;e={token:f.fcmToken,createTime:(l=f.createTime)!==null&&l!==void 0?l:Date.now(),subscriptionOptions:{auth:f.auth,p256dh:f.p256dh,endpoint:f.endpoint,swScope:f.swScope,vapidKey:typeof f.vapidKey=="string"?f.vapidKey:Un(f.vapidKey)}}}else if(s===3){const f=c;e={token:f.fcmToken,createTime:f.createTime,subscriptionOptions:{auth:Un(f.auth),p256dh:Un(f.p256dh),endpoint:f.endpoint,swScope:f.swScope,vapidKey:Un(f.vapidKey)}}}else if(s===4){const f=c;e={token:f.fcmToken,createTime:f.createTime,subscriptionOptions:{auth:Un(f.auth),p256dh:Un(f.p256dh),endpoint:f.endpoint,swScope:f.swScope,vapidKey:Un(f.vapidKey)}}}}}})).close(),await hh(xh),await hh("fcm_vapid_details_db"),await hh("undefined"),Z4(e)?e:null}function Z4(t){if(!t||!t.subscriptionOptions)return!1;const{subscriptionOptions:e}=t;return typeof t.createTime=="number"&&t.createTime>0&&typeof t.token=="string"&&t.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
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
 */const eM="firebase-messaging-database",tM=1,Ba="firebase-messaging-store";let Ih=null;function GI(){return Ih||(Ih=Uc(eM,tM,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(Ba)}}})),Ih}async function nM(t){const e=KI(t),r=await(await GI()).transaction(Ba).objectStore(Ba).get(e);if(r)return r;{const s=await J4(t.appConfig.senderId);if(s)return await Zm(t,s),s}}async function Zm(t,e){const n=KI(t),s=(await GI()).transaction(Ba,"readwrite");return await s.objectStore(Ba).put(e,n),await s.done,e}function KI({appConfig:t}){return t.appId}/**
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
 */const rM={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},pt=new Ks("messaging","Messaging",rM);/**
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
 */async function sM(t,e){const n=await tg(t),r=QI(e),s={method:"POST",headers:n,body:JSON.stringify(r)};let i;try{i=await(await fetch(eg(t.appConfig),s)).json()}catch(o){throw pt.create("token-subscribe-failed",{errorInfo:o==null?void 0:o.toString()})}if(i.error){const o=i.error.message;throw pt.create("token-subscribe-failed",{errorInfo:o})}if(!i.token)throw pt.create("token-subscribe-no-token");return i.token}async function iM(t,e){const n=await tg(t),r=QI(e.subscriptionOptions),s={method:"PATCH",headers:n,body:JSON.stringify(r)};let i;try{i=await(await fetch(`${eg(t.appConfig)}/${e.token}`,s)).json()}catch(o){throw pt.create("token-update-failed",{errorInfo:o==null?void 0:o.toString()})}if(i.error){const o=i.error.message;throw pt.create("token-update-failed",{errorInfo:o})}if(!i.token)throw pt.create("token-update-no-token");return i.token}async function oM(t,e){const r={method:"DELETE",headers:await tg(t)};try{const i=await(await fetch(`${eg(t.appConfig)}/${e}`,r)).json();if(i.error){const o=i.error.message;throw pt.create("token-unsubscribe-failed",{errorInfo:o})}}catch(s){throw pt.create("token-unsubscribe-failed",{errorInfo:s==null?void 0:s.toString()})}}function eg({projectId:t}){return`${q4}/projects/${t}/registrations`}async function tg({appConfig:t,installations:e}){const n=await e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t.apiKey,"x-goog-firebase-installations-auth":`FIS ${n}`})}function QI({p256dh:t,auth:e,endpoint:n,vapidKey:r}){const s={web:{endpoint:n,auth:e,p256dh:t}};return r!==HI&&(s.web.applicationPubKey=r),s}/**
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
 */const aM=7*24*60*60*1e3;async function lM(t){const e=await cM(t.swRegistration,t.vapidKey),n={vapidKey:t.vapidKey,swScope:t.swRegistration.scope,endpoint:e.endpoint,auth:Un(e.getKey("auth")),p256dh:Un(e.getKey("p256dh"))},r=await nM(t.firebaseDependencies);if(r){if(dM(r.subscriptionOptions,n))return Date.now()>=r.createTime+aM?uM(t,{token:r.token,createTime:Date.now(),subscriptionOptions:n}):r.token;try{await oM(t.firebaseDependencies,r.token)}catch(s){console.warn(s)}return i0(t.firebaseDependencies,n)}else return i0(t.firebaseDependencies,n)}async function uM(t,e){try{const n=await iM(t.firebaseDependencies,e),r=Object.assign(Object.assign({},e),{token:n,createTime:Date.now()});return await Zm(t.firebaseDependencies,r),n}catch(n){throw n}}async function i0(t,e){const r={token:await sM(t,e),createTime:Date.now(),subscriptionOptions:e};return await Zm(t,r),r.token}async function cM(t,e){const n=await t.pushManager.getSubscription();return n||t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Y4(e)})}function dM(t,e){const n=e.vapidKey===t.vapidKey,r=e.endpoint===t.endpoint,s=e.auth===t.auth,i=e.p256dh===t.p256dh;return n&&r&&s&&i}/**
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
 */function o0(t){const e={from:t.from,collapseKey:t.collapse_key,messageId:t.fcmMessageId};return hM(e,t),fM(e,t),pM(e,t),e}function hM(t,e){if(!e.notification)return;t.notification={};const n=e.notification.title;n&&(t.notification.title=n);const r=e.notification.body;r&&(t.notification.body=r);const s=e.notification.image;s&&(t.notification.image=s);const i=e.notification.icon;i&&(t.notification.icon=i)}function fM(t,e){e.data&&(t.data=e.data)}function pM(t,e){var n,r,s,i,o;if(!e.fcmOptions&&!(!((n=e.notification)===null||n===void 0)&&n.click_action))return;t.fcmOptions={};const l=(s=(r=e.fcmOptions)===null||r===void 0?void 0:r.link)!==null&&s!==void 0?s:(i=e.notification)===null||i===void 0?void 0:i.click_action;l&&(t.fcmOptions.link=l);const u=(o=e.fcmOptions)===null||o===void 0?void 0:o.analytics_label;u&&(t.fcmOptions.analyticsLabel=u)}/**
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
 */function mM(t){return typeof t=="object"&&!!t&&qI in t}/**
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
 */function gM(t){if(!t||!t.options)throw Sh("App Configuration Object");if(!t.name)throw Sh("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:n}=t;for(const r of e)if(!n[r])throw Sh(r);return{appName:t.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function Sh(t){return pt.create("missing-app-config-values",{valueName:t})}/**
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
 */let yM=class{constructor(e,n,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const s=gM(e);this.firebaseDependencies={app:e,appConfig:s,installations:n,analyticsProvider:r}}_delete(){return Promise.resolve()}};/**
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
 */async function vM(t){try{t.swRegistration=await navigator.serviceWorker.register(W4,{scope:H4}),t.swRegistration.update().catch(()=>{}),await _M(t.swRegistration)}catch(e){throw pt.create("failed-service-worker-registration",{browserErrorMessage:e==null?void 0:e.message})}}async function _M(t){return new Promise((e,n)=>{const r=setTimeout(()=>n(new Error(`Service worker not registered after ${n0} ms`)),n0),s=t.installing||t.waiting;t.active?(clearTimeout(r),e()):s?s.onstatechange=i=>{var o;((o=i.target)===null||o===void 0?void 0:o.state)==="activated"&&(s.onstatechange=null,clearTimeout(r),e())}:(clearTimeout(r),n(new Error("No incoming service worker found.")))})}/**
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
 */async function wM(t,e){if(!e&&!t.swRegistration&&await vM(t),!(!e&&t.swRegistration)){if(!(e instanceof ServiceWorkerRegistration))throw pt.create("invalid-sw-registration");t.swRegistration=e}}/**
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
 */async function EM(t,e){e?t.vapidKey=e:t.vapidKey||(t.vapidKey=HI)}/**
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
 */async function YI(t,e){if(!navigator)throw pt.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw pt.create("permission-blocked");return await EM(t,e==null?void 0:e.vapidKey),await wM(t,e==null?void 0:e.serviceWorkerRegistration),lM(t)}/**
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
 */async function TM(t,e,n){const r=xM(e);(await t.firebaseDependencies.analyticsProvider.get()).logEvent(r,{message_id:n[qI],message_name:n[G4],message_time:n[K4],message_device_time:Math.floor(Date.now()/1e3)})}function xM(t){switch(t){case Ua.NOTIFICATION_CLICKED:return"notification_open";case Ua.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
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
 */async function IM(t,e){const n=e.data;if(!n.isFirebaseMessaging)return;t.onMessageHandler&&n.messageType===Ua.PUSH_RECEIVED&&(typeof t.onMessageHandler=="function"?t.onMessageHandler(o0(n)):t.onMessageHandler.next(o0(n)));const r=n.data;mM(r)&&r[Q4]==="1"&&await TM(t,n.messageType,r)}const a0="@firebase/messaging",l0="0.12.22";/**
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
 */const SM=t=>{const e=new yM(t.getProvider("app").getImmediate(),t.getProvider("installations-internal").getImmediate(),t.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",n=>IM(e,n)),e},AM=t=>{const e=t.getProvider("messaging").getImmediate();return{getToken:r=>YI(e,r)}};function kM(){en(new zt("messaging",SM,"PUBLIC")),en(new zt("messaging-internal",AM,"PRIVATE")),ft(a0,l0),ft(a0,l0,"esm2017")}/**
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
 */async function XI(){try{await sT()}catch{return!1}return typeof window<"u"&&rT()&&Qb()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
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
 */function bM(t,e){if(!navigator)throw pt.create("only-available-in-window");return t.onMessageHandler=e,()=>{t.onMessageHandler=null}}/**
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
 */function JI(t=Ya()){return XI().then(e=>{if(!e)throw pt.create("unsupported-browser")},e=>{throw pt.create("indexed-db-unsupported")}),ts(ce(t),"messaging").getImmediate()}async function CM(t,e){return t=ce(t),YI(t,e)}function NM(t,e){return t=ce(t),bM(t,e)}kM();const RM={BASE_URL:"/",DEV:!1,MODE:"production",PROD:!0,SSR:!1,VITE_AUTH_EMAIL_LINK_URL:"https://bueno-brows-7cce7.web.app/verify",VITE_FIREBASE_API_KEY:"AIzaSyDMsLYmLj4qZR2Ty5sJJX9ZEZInc61dJos",VITE_FIREBASE_APP_ID:"1:494398949506:web:b4e591e20590044c72cc9b",VITE_FIREBASE_AUTH_DOMAIN:"bueno-brows-7cce7.firebaseapp.com",VITE_FIREBASE_FUNCTIONS_REGION:"us-central1",VITE_FIREBASE_MESSAGING_SENDER_ID:"494398949506",VITE_FIREBASE_PROJECT_ID:"bueno-brows-7cce7",VITE_FIREBASE_STORAGE_BUCKET:"bueno-brows-7cce7.firebasestorage.app",VITE_USE_EMULATORS:"0"};function ii(t){const e=RM[t];if(!e){const n=t==="VITE_FIREBASE_API_KEY"?"***":"";throw console.error(`[Firebase] Missing env: ${t}${n?" ("+n+")":""}`),new Error(`Missing env ${t}`)}return e}let Ql=null;function hd(){if(Ql)return Ql;const t={apiKey:ii("VITE_FIREBASE_API_KEY"),authDomain:ii("VITE_FIREBASE_AUTH_DOMAIN"),projectId:ii("VITE_FIREBASE_PROJECT_ID"),storageBucket:ii("VITE_FIREBASE_STORAGE_BUCKET"),messagingSenderId:ii("VITE_FIREBASE_MESSAGING_SENDER_ID"),appId:ii("VITE_FIREBASE_APP_ID")},e=eN(),n=e.length>0?e[0]:aT(t);console.log("[Firebase] App initialized:",n.name,n.options.projectId);const r=Yf(n),s=ur(n);console.log("[Firebase] Firestore and Auth initialized");const o=ud(n,"us-central1");let l;return typeof window<"u"&&XI().then(u=>{u&&(l=JI(n))}),Ql={app:n,db:r,auth:s,functions:o,messaging:l},Ql}const ZI=D.createContext(null);function PM({children:t}){const e=D.useMemo(()=>hd(),[]);return d.jsx(ZI.Provider,{value:e,children:t})}function os(){const t=D.useContext(ZI);if(!t)throw new Error("useFirebase must be used within FirebaseProvider");return t}function DM(){const[t,e]=D.useState(null),n=to(),r=ur();D.useEffect(()=>{const i=ol(r,e);return()=>i()},[r]);const s=({isActive:i})=>`px-3 py-2 rounded-md text-sm ${i?"bg-terracotta text-white":"hover:bg-white/50"}`;return d.jsx("header",{className:"bg-white/80 backdrop-blur border-b",children:d.jsxs("div",{className:"max-w-6xl mx-auto flex items-center justify-between p-4",children:[d.jsxs(As,{to:"/",className:"text-2xl",children:[d.jsx("span",{className:"font-brandBueno text-brand-bueno",children:"BUENO"}),d.jsx("span",{className:"ml-2 font-brandBrows text-brand-brows",children:"BROWS"})]}),d.jsxs("nav",{className:"flex items-center gap-2",children:[d.jsx(Po,{to:"/",className:s,end:!0,children:"Home"}),d.jsx(Po,{to:"/services",className:s,children:"Services"}),d.jsx(Po,{to:"/book",className:s,children:"Book"}),d.jsx(Po,{to:"/skin-analysis",className:s,children:"Skin Analysis"}),d.jsx(Po,{to:"/reviews",className:s,children:"Reviews"}),t?d.jsx("button",{onClick:()=>n("/dashboard"),className:"px-3 py-2 rounded-md text-sm bg-terracotta text-white hover:bg-terracotta/90",children:"My Bookings"}):d.jsx("button",{onClick:()=>n("/login"),className:"px-3 py-2 rounded-md text-sm bg-terracotta text-white hover:bg-terracotta/90",children:"Login"})]})]})})}function e1(t,e,n){const r=je(t,"services"),s=e!=null&&e.activeOnly?Ct(r,Tt("active","==",!0),Hn("name","asc")):Ct(r,Hn("name","asc"));return Xt(s,i=>{const o=i.docs.map(l=>({id:l.id,...l.data()}));n(o)})}function OM(t,e,n){const r=new Date(e);r.setHours(0,0,0,0);const s=new Date(e);s.setHours(23,59,59,999);const i=Ct(je(t,"appointments"),Tt("start",">=",r.toISOString()),Tt("start","<=",s.toISOString()),Hn("start","asc"));return Xt(i,o=>{const l=[];o.forEach(u=>{const c={id:u.id,...u.data()};c.status!=="cancelled"&&l.push(c)}),n(l)})}function MM(t,e){const n=Vs(t,"settings","businessHours");return Xt(n,r=>{const s=r.data();if(!s){e({timezone:"America/Los_Angeles",slotInterval:15,slots:{sun:[],mon:[],tue:[],wed:[],thu:[],fri:[],sat:[]}});return}const i={timezone:s.timezone||"America/Los_Angeles",slotInterval:s.slotInterval||15,slots:{sun:[],mon:[],tue:[],wed:[],thu:[],fri:[],sat:[]}};s.slots&&Object.entries(s.slots).forEach(([o,l])=>{l&&l.ranges&&Array.isArray(l.ranges)&&(i.slots[o]=l.ranges.map(u=>[u.start,u.end]))}),e(i)})}function jM(t,e){const n=Vs(t,"settings","businessInfo");return Xt(n,r=>{if(!r.exists()){e({name:"BUENO BROWS",address:"315 9th Ave",city:"San Mateo",state:"CA",zip:"94401",phone:"(650) 613-8455",email:"hello@buenobrows.com",instagram:"buenobrows",tiktok:"buenobrows"});return}e(r.data())})}function LM(t,e){const n=Vs(t,"settings","homePageContent");return Xt(n,r=>{if(!r.exists()){e({heroTitle:"Refined. Natural. You.",heroSubtitle:"Filipino-inspired beauty studio specializing in brows & lashes. Thoughtfully scheduled, never rushed.",ctaPrimary:"Book now",ctaSecondary:"See services",aboutText:"At BUENO BROWS, we believe beauty is personal. Our Filipino-inspired approach combines precision with warmth, creating results that enhance your natural features.",buenoCircleEnabled:!0,buenoCircleTitle:"Join the Bueno Circle",buenoCircleDescription:"Get 10% off your first appointment and exclusive updates!",buenoCircleDiscount:10});return}e(r.data())})}function VM(){const{db:t}=os(),[e,n]=D.useState(null),[r,s]=D.useState(null),[i,o]=D.useState(""),[l,u]=D.useState(!1);D.useEffect(()=>jM(t,n),[t]),D.useEffect(()=>LM(t,s),[t]);const c=async f=>{f.preventDefault(),i.trim()&&(console.log("Bueno Circle signup:",i),u(!0),o(""),setTimeout(()=>u(!1),3e3))};return!e||!r?d.jsx("div",{className:"text-center py-12 text-slate-500",children:"Loading..."}):d.jsxs("div",{className:"space-y-12",children:[d.jsxs("section",{className:"grid md:grid-cols-2 gap-8 items-center",children:[d.jsxs("div",{children:[d.jsx("h1",{className:"font-serif text-4xl text-terracotta mb-3",children:r.heroTitle}),d.jsx("p",{className:"text-slate-600 mb-6",children:r.heroSubtitle}),d.jsxs("div",{className:"flex gap-3",children:[d.jsx(As,{to:"/book",className:"bg-terracotta text-white rounded-md px-6 py-3 hover:bg-terracotta/90 transition-colors",children:r.ctaPrimary}),d.jsx(As,{to:"/services",className:"border border-slate-300 rounded-md px-6 py-3 hover:bg-slate-50 transition-colors",children:r.ctaSecondary})]})]}),d.jsxs("div",{className:"relative bg-white rounded-2xl shadow-soft h-96 grid place-items-center overflow-hidden",children:[r.heroImageUrl?d.jsx("img",{src:r.heroImageUrl,alt:"BUENO BROWS",className:"w-full h-full object-cover"}):d.jsx("span",{className:"text-slate-400",children:"Hero image (TBD)"}),d.jsxs("div",{className:"pointer-events-none absolute inset-0",children:[d.jsx("div",{className:"absolute -top-3 -left-3 w-24 h-24 rounded-full bg-terracotta/5"}),d.jsx("div",{className:"absolute -bottom-4 -right-4 w-28 h-28 rounded-full bg-gold/10"})]})]})]}),r.aboutText&&d.jsxs("section",{className:"bg-white rounded-xl shadow-soft p-8 text-center",children:[d.jsx("h2",{className:"font-serif text-2xl text-terracotta mb-4",children:"Our Story"}),d.jsx("p",{className:"text-slate-600 max-w-3xl mx-auto",children:r.aboutText})]}),d.jsx("section",{className:"bg-white rounded-xl shadow-soft overflow-hidden",children:d.jsxs("div",{className:"grid md:grid-cols-2 gap-0",children:[d.jsx("div",{className:"h-80 md:h-auto",children:d.jsx("iframe",{title:"Business Location",src:`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${e.address}, ${e.city}, ${e.state} ${e.zip}`)}`,width:"100%",height:"100%",style:{border:0,minHeight:"320px"},allowFullScreen:!0,loading:"lazy",referrerPolicy:"no-referrer-when-downgrade"})}),d.jsxs("div",{className:"p-8",children:[d.jsx("h2",{className:"font-serif text-2xl text-terracotta mb-6",children:"Visit Us"}),d.jsxs("div",{className:"space-y-4",children:[d.jsxs("div",{children:[d.jsx("h3",{className:"text-sm font-semibold text-slate-700 mb-1",children:"Address"}),d.jsx("p",{className:"text-slate-600",children:e.address}),d.jsxs("p",{className:"text-slate-600",children:[e.city,", ",e.state," ",e.zip]})]}),d.jsxs("div",{children:[d.jsx("h3",{className:"text-sm font-semibold text-slate-700 mb-1",children:"Contact"}),d.jsx("p",{className:"text-slate-600",children:d.jsx("a",{href:`tel:${e.phone.replace(/\D/g,"")}`,className:"hover:text-terracotta transition-colors",children:e.phone})}),d.jsx("p",{className:"text-slate-600",children:d.jsx("a",{href:`mailto:${e.email}`,className:"hover:text-terracotta transition-colors",children:e.email})})]}),d.jsxs("div",{children:[d.jsx("h3",{className:"text-sm font-semibold text-slate-700 mb-2",children:"Get Directions"}),d.jsxs("a",{href:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.address}, ${e.city}, ${e.state} ${e.zip}`)}`,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 text-terracotta hover:underline",children:[d.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"})}),"Open in Google Maps"]})]}),(e.instagram||e.tiktok||e.facebook)&&d.jsxs("div",{className:"pt-4 border-t",children:[d.jsx("h3",{className:"text-sm font-semibold text-slate-700 mb-2",children:"Connect With Us"}),d.jsxs("div",{className:"flex items-center gap-3",children:[e.instagram&&d.jsx("a",{href:`https://instagram.com/${e.instagram}`,target:"_blank",rel:"noopener noreferrer",className:"bg-slate-100 p-2 rounded-lg text-slate-700 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all duration-300","aria-label":"Instagram",children:d.jsx("svg",{className:"w-5 h-5",fill:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{d:"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"})})}),e.tiktok&&d.jsx("a",{href:`https://tiktok.com/@${e.tiktok}`,target:"_blank",rel:"noopener noreferrer",className:"bg-slate-100 p-2 rounded-lg text-slate-700 hover:text-white hover:bg-black transition-all duration-300","aria-label":"TikTok",children:d.jsx("svg",{className:"w-5 h-5",fill:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{d:"M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"})})}),e.facebook&&d.jsx("a",{href:`https://facebook.com/${e.facebook}`,target:"_blank",rel:"noopener noreferrer",className:"bg-slate-100 p-2 rounded-lg text-slate-700 hover:text-white hover:bg-blue-600 transition-all duration-300","aria-label":"Facebook",children:d.jsx("svg",{className:"w-5 h-5",fill:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{d:"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"})})})]})]})]})]})]})}),r.galleryPhotos&&r.galleryPhotos.length>0&&d.jsxs("section",{children:[d.jsx("h2",{className:"font-serif text-3xl text-center mb-2 text-terracotta",children:"Our Space"}),d.jsx("p",{className:"text-center text-slate-600 mb-8",children:"Take a peek inside our beautiful studio"}),d.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",children:r.galleryPhotos.map((f,m)=>d.jsxs("div",{className:"group relative aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer",children:[d.jsx("img",{src:f,alt:`Shop photo ${m+1}`,className:"w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"}),d.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-terracotta/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"})]},m))}),d.jsx("div",{className:"relative mt-8 flex justify-center",children:d.jsxs("div",{className:"flex gap-2",children:[d.jsx("div",{className:"w-2 h-2 rounded-full bg-terracotta/30"}),d.jsx("div",{className:"w-2 h-2 rounded-full bg-gold/40"}),d.jsx("div",{className:"w-2 h-2 rounded-full bg-terracotta/30"})]})})]}),r.buenoCircleEnabled&&d.jsx("section",{className:"bg-gradient-to-br from-terracotta/10 to-gold/10 rounded-xl shadow-soft p-8",children:d.jsxs("div",{className:"max-w-2xl mx-auto text-center",children:[d.jsx("h2",{className:"font-serif text-3xl text-terracotta mb-3",children:r.buenoCircleTitle}),d.jsx("p",{className:"text-slate-600 mb-6",children:r.buenoCircleDescription}),l?d.jsxs("div",{className:"bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto",children:[d.jsx("p",{className:"text-green-700 font-medium",children:"🎉 Welcome to the Bueno Circle!"}),d.jsx("p",{className:"text-green-600 text-sm mt-1",children:"We'll text you your discount code shortly."})]}):d.jsxs("form",{onSubmit:c,className:"flex flex-col sm:flex-row gap-3 max-w-md mx-auto",children:[d.jsx("input",{type:"tel",placeholder:"Enter your phone number",value:i,onChange:f=>o(f.target.value),className:"flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-terracotta focus:border-transparent",required:!0}),d.jsxs("button",{type:"submit",className:"bg-terracotta text-white rounded-lg px-6 py-3 hover:bg-terracotta/90 transition-colors whitespace-nowrap",children:["Get ",r.buenoCircleDiscount,"% Off"]})]})]})}),d.jsxs("section",{id:"reviews",children:[d.jsx("h2",{className:"font-serif text-3xl text-center mb-8 text-terracotta",children:"What Clients Say"}),d.jsx("div",{className:"grid sm:grid-cols-2 lg:grid-cols-3 gap-6",children:[1,2,3].map(f=>d.jsxs("div",{className:"bg-white rounded-xl shadow-soft p-6",children:[d.jsx("div",{className:"flex mb-3",children:[...Array(5)].map((m,g)=>d.jsx("svg",{className:"w-5 h-5 text-gold fill-current",viewBox:"0 0 20 20",children:d.jsx("path",{d:"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"})},g))}),d.jsx("p",{className:"text-slate-700 mb-3",children:'"Beautiful, natural results. Booking was easy and I felt cared for."'}),d.jsx("div",{className:"text-sm text-slate-500",children:"— Happy Client"})]},f))}),d.jsx("div",{className:"text-center mt-8",children:d.jsx(As,{to:"/reviews",className:"text-terracotta hover:underline",children:"See all reviews →"})})]})]})}function FM(){const{db:t}=os(),[e,n]=D.useState([]),[r,s]=D.useState(""),[i,o]=D.useState("All");D.useEffect(()=>e1(t,{activeOnly:!0},n),[]);const l=D.useMemo(()=>{const c=new Set;return e.forEach(f=>f.category&&c.add(f.category)),["All",...Array.from(c).sort()]},[e]),u=D.useMemo(()=>{const c=r.trim().toLowerCase();return e.filter(f=>{const m=i==="All"||f.category===i,g=!c||f.name.toLowerCase().includes(c)||(f.description||"").toLowerCase().includes(c);return m&&g})},[e,r,i]);return d.jsxs("section",{className:"grid gap-4",children:[d.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3",children:[d.jsxs("div",{children:[d.jsx("h2",{className:"font-serif text-2xl",children:"Services"}),d.jsx("p",{className:"text-slate-600 text-sm",children:"Explore our offerings. Prices reflect current rates; your booked price is saved at confirmation."})]}),d.jsxs("div",{className:"flex flex-wrap gap-2",children:[d.jsx("input",{className:"border rounded-md p-2 min-w-[200px]",placeholder:"Search services…",value:r,onChange:c=>s(c.target.value),"aria-label":"Search services"}),d.jsx("select",{className:"border rounded-md p-2",value:i,onChange:c=>o(c.target.value),"aria-label":"Filter by category",children:l.map(c=>d.jsx("option",{value:c,children:c},c))})]})]}),d.jsxs("div",{className:"grid sm:grid-cols-2 lg:grid-cols-3 gap-4",children:[u.map(c=>d.jsxs("article",{className:"bg-white rounded-xl shadow-soft p-4 flex flex-col",children:[d.jsxs("header",{className:"mb-2",children:[d.jsx("div",{className:"text-sm text-slate-500",children:c.category||"Service"}),d.jsx("h3",{className:"font-medium text-lg",children:c.name})]}),d.jsx("p",{className:"text-sm text-slate-600 min-h-[2.5rem]",children:c.description||"Beautiful brows, tailored to you."}),d.jsxs("div",{className:"mt-3 text-sm text-slate-700",children:["Duration: ",c.duration," min"]}),d.jsxs("div",{className:"mt-1 text-terracotta font-semibold",children:["$",c.price.toFixed(2)]}),d.jsx("div",{className:"mt-auto pt-3",children:d.jsx(As,{to:"/book",className:"inline-block bg-terracotta text-white rounded-md px-3 py-2",children:"Book this"})})]},c.id)),!u.length&&d.jsx("div",{className:"text-slate-500 text-sm",children:"No services match your search. Try clearing filters."})]})]})}function UM(t,e,n,r){const s=n.timezone||"America/Los_Angeles",i=["sun","mon","tue","wed","thu","fri","sat"][t.getDay()],o=n.slots[i]||[],l=Math.max(5,n.slotInterval||15),u=[];for(const[c,f]of o){const m=u0(t,c,s),g=u0(t,f,s);for(let x=m.getTime();x+e*6e4<=g.getTime();x+=l*6e4){const A=new Date(x).toISOString(),C=x+e*6e4;BM(x,C,r)||u.push(A)}}return u}function BM(t,e,n){for(const r of n){if(r.status==="cancelled")continue;const s=new Date(r.start).getTime(),i=s+r.duration*6e4;if(s<e&&i>t)return!0}return!1}function u0(t,e,n){const[r,s]=e.split(":").map(l=>parseInt(l,10)),i=new Intl.DateTimeFormat("en-US",{timeZone:n,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).formatToParts(new Date(t.getFullYear(),t.getMonth(),t.getDate(),r,s,0)),o=l=>{var u;return Number(((u=i.find(c=>c.type===l))==null?void 0:u.value)||"0")};return new Date(o("year"),o("month")-1,o("day"),o("hour"),o("minute"),o("second"))}function $M(t,e){var i;if(!e)return!1;const n=["sun","mon","tue","wed","thu","fri","sat"][t.getDay()],r=(i=e.slots)==null?void 0:i[n];if(!r)return!1;let s=[];return Array.isArray(r)?s=r:r&&"ranges"in r&&(s=r.ranges.map(o=>[o.start,o.end])),s.length>0}function zM(){return 0}function t1(){return 90}function Tu(t,e){const n=new Date;n.setHours(0,0,0,0);const r=new Date(t);r.setHours(0,0,0,0);const s=Math.floor((r.getTime()-n.getTime())/(1e3*60*60*24));return s<zM()||s>t1()?!1:$M(t,e)}function n1(t){const e=[],n=new Date;n.setHours(0,0,0,0);const r=t1();for(let s=0;s<=r;s++){const i=new Date(n);i.setDate(n.getDate()+s),Tu(i,t)&&e.push(i)}return e}function WM(t){const e=n1(t);return e.length>0?e[0]:null}function HM(t,e){return e&&n1(e).find(r=>r>t)||null}function qM(t){const e=new Date,n=new Date(e);n.setDate(e.getDate()+1);const r=new Date(t);return r.setHours(0,0,0,0),e.setHours(0,0,0,0),n.setHours(0,0,0,0),r.getTime()===e.getTime()?"today":r.getTime()===n.getTime()?"tomorrow":t.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}function GM(t,e){var o;if(!e)return"Business hours not available";const n=["sun","mon","tue","wed","thu","fri","sat"][t.getDay()],r=(o=e.slots)==null?void 0:o[n];if(!r)return"Closed";let s=[];return Array.isArray(r)?s=r:r&&"ranges"in r&&(s=r.ranges.map(l=>[l.start,l.end])),s.length===0?"Closed":s.map(([l,u])=>{const c=c0(l),f=c0(u);return`${c} - ${f}`}).join(", ")}function c0(t){const[e,n]=t.split(":").map(Number),r=new Date;return r.setHours(e,n,0,0),r.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function KM(t){var o;if(!t)return!1;const e=new Date,n=["sun","mon","tue","wed","thu","fri","sat"][e.getDay()],r=(o=t.slots)==null?void 0:o[n];if(!r)return!1;let s=[];if(Array.isArray(r)?s=r:r&&"ranges"in r&&(s=r.ranges.map(l=>[l.start,l.end])),s.length===0)return!1;const i=e.toTimeString().slice(0,5);return s.some(([l,u])=>i>=l&&i<=u)}function fd(){const{app:t}=hd();return ud(t,"us-central1")}function pd(t){return((t==null?void 0:t.message)||"").includes("E_OVERLAP")||(t==null?void 0:t.details)==="E_OVERLAP"?new Error("E_OVERLAP"):new Error((t==null?void 0:t.message)||"Function call failed")}async function QM(t){try{return(await ao(fd(),"createSlotHold")(t)).data}catch(e){throw pd(e)}}async function YM(t){try{return(await ao(fd(),"finalizeBookingFromHold")(t)).data}catch(e){throw pd(e)}}async function XM(t){try{return(await ao(fd(),"releaseHold")({holdId:t})).data}catch(e){throw pd(e)}}async function d0(t){try{return(await ao(fd(),"findOrCreateCustomer")(t)).data}catch(e){throw pd(e)}}function JM(t="bb_session"){if(typeof window>"u")return h0();const e=window.sessionStorage.getItem(t);if(e)return e;const n=h0();return window.sessionStorage.setItem(t,n),n}function h0(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)}function vn(t){const e=Object.prototype.toString.call(t);return t instanceof Date||typeof t=="object"&&e==="[object Date]"?new t.constructor(+t):typeof t=="number"||e==="[object Number]"||typeof t=="string"||e==="[object String]"?new Date(t):new Date(NaN)}function zs(t,e){return t instanceof Date?new t.constructor(e):new Date(e)}const r1=6048e5,ZM=864e5,s1=6e4,i1=36e5;let ej={};function md(){return ej}function $a(t,e){var l,u,c,f;const n=md(),r=(e==null?void 0:e.weekStartsOn)??((u=(l=e==null?void 0:e.locale)==null?void 0:l.options)==null?void 0:u.weekStartsOn)??n.weekStartsOn??((f=(c=n.locale)==null?void 0:c.options)==null?void 0:f.weekStartsOn)??0,s=vn(t),i=s.getDay(),o=(i<r?7:0)+i-r;return s.setDate(s.getDate()-o),s.setHours(0,0,0,0),s}function yc(t){return $a(t,{weekStartsOn:1})}function o1(t){const e=vn(t),n=e.getFullYear(),r=zs(t,0);r.setFullYear(n+1,0,4),r.setHours(0,0,0,0);const s=yc(r),i=zs(t,0);i.setFullYear(n,0,4),i.setHours(0,0,0,0);const o=yc(i);return e.getTime()>=s.getTime()?n+1:e.getTime()>=o.getTime()?n:n-1}function f0(t){const e=vn(t);return e.setHours(0,0,0,0),e}function p0(t){const e=vn(t),n=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()));return n.setUTCFullYear(e.getFullYear()),+t-+n}function tj(t,e){const n=f0(t),r=f0(e),s=+n-p0(n),i=+r-p0(r);return Math.round((s-i)/ZM)}function nj(t){const e=o1(t),n=zs(t,0);return n.setFullYear(e,0,4),n.setHours(0,0,0,0),yc(n)}function rj(t){return t instanceof Date||typeof t=="object"&&Object.prototype.toString.call(t)==="[object Date]"}function sj(t){if(!rj(t)&&typeof t!="number")return!1;const e=vn(t);return!isNaN(Number(e))}function ij(t){const e=vn(t),n=zs(t,0);return n.setFullYear(e.getFullYear(),0,1),n.setHours(0,0,0,0),n}const oj={lessThanXSeconds:{one:"less than a second",other:"less than {{count}} seconds"},xSeconds:{one:"1 second",other:"{{count}} seconds"},halfAMinute:"half a minute",lessThanXMinutes:{one:"less than a minute",other:"less than {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"about 1 hour",other:"about {{count}} hours"},xHours:{one:"1 hour",other:"{{count}} hours"},xDays:{one:"1 day",other:"{{count}} days"},aboutXWeeks:{one:"about 1 week",other:"about {{count}} weeks"},xWeeks:{one:"1 week",other:"{{count}} weeks"},aboutXMonths:{one:"about 1 month",other:"about {{count}} months"},xMonths:{one:"1 month",other:"{{count}} months"},aboutXYears:{one:"about 1 year",other:"about {{count}} years"},xYears:{one:"1 year",other:"{{count}} years"},overXYears:{one:"over 1 year",other:"over {{count}} years"},almostXYears:{one:"almost 1 year",other:"almost {{count}} years"}},aj=(t,e,n)=>{let r;const s=oj[t];return typeof s=="string"?r=s:e===1?r=s.one:r=s.other.replace("{{count}}",e.toString()),n!=null&&n.addSuffix?n.comparison&&n.comparison>0?"in "+r:r+" ago":r};function Ah(t){return(e={})=>{const n=e.width?String(e.width):t.defaultWidth;return t.formats[n]||t.formats[t.defaultWidth]}}const lj={full:"EEEE, MMMM do, y",long:"MMMM do, y",medium:"MMM d, y",short:"MM/dd/yyyy"},uj={full:"h:mm:ss a zzzz",long:"h:mm:ss a z",medium:"h:mm:ss a",short:"h:mm a"},cj={full:"{{date}} 'at' {{time}}",long:"{{date}} 'at' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},dj={date:Ah({formats:lj,defaultWidth:"full"}),time:Ah({formats:uj,defaultWidth:"full"}),dateTime:Ah({formats:cj,defaultWidth:"full"})},hj={lastWeek:"'last' eeee 'at' p",yesterday:"'yesterday at' p",today:"'today at' p",tomorrow:"'tomorrow at' p",nextWeek:"eeee 'at' p",other:"P"},fj=(t,e,n,r)=>hj[t];function Do(t){return(e,n)=>{const r=n!=null&&n.context?String(n.context):"standalone";let s;if(r==="formatting"&&t.formattingValues){const o=t.defaultFormattingWidth||t.defaultWidth,l=n!=null&&n.width?String(n.width):o;s=t.formattingValues[l]||t.formattingValues[o]}else{const o=t.defaultWidth,l=n!=null&&n.width?String(n.width):t.defaultWidth;s=t.values[l]||t.values[o]}const i=t.argumentCallback?t.argumentCallback(e):e;return s[i]}}const pj={narrow:["B","A"],abbreviated:["BC","AD"],wide:["Before Christ","Anno Domini"]},mj={narrow:["1","2","3","4"],abbreviated:["Q1","Q2","Q3","Q4"],wide:["1st quarter","2nd quarter","3rd quarter","4th quarter"]},gj={narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],wide:["January","February","March","April","May","June","July","August","September","October","November","December"]},yj={narrow:["S","M","T","W","T","F","S"],short:["Su","Mo","Tu","We","Th","Fr","Sa"],abbreviated:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],wide:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},vj={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"}},_j={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"}},wj=(t,e)=>{const n=Number(t),r=n%100;if(r>20||r<10)switch(r%10){case 1:return n+"st";case 2:return n+"nd";case 3:return n+"rd"}return n+"th"},Ej={ordinalNumber:wj,era:Do({values:pj,defaultWidth:"wide"}),quarter:Do({values:mj,defaultWidth:"wide",argumentCallback:t=>t-1}),month:Do({values:gj,defaultWidth:"wide"}),day:Do({values:yj,defaultWidth:"wide"}),dayPeriod:Do({values:vj,defaultWidth:"wide",formattingValues:_j,defaultFormattingWidth:"wide"})};function Oo(t){return(e,n={})=>{const r=n.width,s=r&&t.matchPatterns[r]||t.matchPatterns[t.defaultMatchWidth],i=e.match(s);if(!i)return null;const o=i[0],l=r&&t.parsePatterns[r]||t.parsePatterns[t.defaultParseWidth],u=Array.isArray(l)?xj(l,m=>m.test(o)):Tj(l,m=>m.test(o));let c;c=t.valueCallback?t.valueCallback(u):u,c=n.valueCallback?n.valueCallback(c):c;const f=e.slice(o.length);return{value:c,rest:f}}}function Tj(t,e){for(const n in t)if(Object.prototype.hasOwnProperty.call(t,n)&&e(t[n]))return n}function xj(t,e){for(let n=0;n<t.length;n++)if(e(t[n]))return n}function Ij(t){return(e,n={})=>{const r=e.match(t.matchPattern);if(!r)return null;const s=r[0],i=e.match(t.parsePattern);if(!i)return null;let o=t.valueCallback?t.valueCallback(i[0]):i[0];o=n.valueCallback?n.valueCallback(o):o;const l=e.slice(s.length);return{value:o,rest:l}}}const Sj=/^(\d+)(th|st|nd|rd)?/i,Aj=/\d+/i,kj={narrow:/^(b|a)/i,abbreviated:/^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,wide:/^(before christ|before common era|anno domini|common era)/i},bj={any:[/^b/i,/^(a|c)/i]},Cj={narrow:/^[1234]/i,abbreviated:/^q[1234]/i,wide:/^[1234](th|st|nd|rd)? quarter/i},Nj={any:[/1/i,/2/i,/3/i,/4/i]},Rj={narrow:/^[jfmasond]/i,abbreviated:/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,wide:/^(january|february|march|april|may|june|july|august|september|october|november|december)/i},Pj={narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^ap/i,/^may/i,/^jun/i,/^jul/i,/^au/i,/^s/i,/^o/i,/^n/i,/^d/i]},Dj={narrow:/^[smtwf]/i,short:/^(su|mo|tu|we|th|fr|sa)/i,abbreviated:/^(sun|mon|tue|wed|thu|fri|sat)/i,wide:/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i},Oj={narrow:[/^s/i,/^m/i,/^t/i,/^w/i,/^t/i,/^f/i,/^s/i],any:[/^su/i,/^m/i,/^tu/i,/^w/i,/^th/i,/^f/i,/^sa/i]},Mj={narrow:/^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,any:/^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i},jj={any:{am:/^a/i,pm:/^p/i,midnight:/^mi/i,noon:/^no/i,morning:/morning/i,afternoon:/afternoon/i,evening:/evening/i,night:/night/i}},Lj={ordinalNumber:Ij({matchPattern:Sj,parsePattern:Aj,valueCallback:t=>parseInt(t,10)}),era:Oo({matchPatterns:kj,defaultMatchWidth:"wide",parsePatterns:bj,defaultParseWidth:"any"}),quarter:Oo({matchPatterns:Cj,defaultMatchWidth:"wide",parsePatterns:Nj,defaultParseWidth:"any",valueCallback:t=>t+1}),month:Oo({matchPatterns:Rj,defaultMatchWidth:"wide",parsePatterns:Pj,defaultParseWidth:"any"}),day:Oo({matchPatterns:Dj,defaultMatchWidth:"wide",parsePatterns:Oj,defaultParseWidth:"any"}),dayPeriod:Oo({matchPatterns:Mj,defaultMatchWidth:"any",parsePatterns:jj,defaultParseWidth:"any"})},Vj={code:"en-US",formatDistance:aj,formatLong:dj,formatRelative:fj,localize:Ej,match:Lj,options:{weekStartsOn:0,firstWeekContainsDate:1}};function Fj(t){const e=vn(t);return tj(e,ij(e))+1}function Uj(t){const e=vn(t),n=+yc(e)-+nj(e);return Math.round(n/r1)+1}function a1(t,e){var f,m,g,x;const n=vn(t),r=n.getFullYear(),s=md(),i=(e==null?void 0:e.firstWeekContainsDate)??((m=(f=e==null?void 0:e.locale)==null?void 0:f.options)==null?void 0:m.firstWeekContainsDate)??s.firstWeekContainsDate??((x=(g=s.locale)==null?void 0:g.options)==null?void 0:x.firstWeekContainsDate)??1,o=zs(t,0);o.setFullYear(r+1,0,i),o.setHours(0,0,0,0);const l=$a(o,e),u=zs(t,0);u.setFullYear(r,0,i),u.setHours(0,0,0,0);const c=$a(u,e);return n.getTime()>=l.getTime()?r+1:n.getTime()>=c.getTime()?r:r-1}function Bj(t,e){var l,u,c,f;const n=md(),r=(e==null?void 0:e.firstWeekContainsDate)??((u=(l=e==null?void 0:e.locale)==null?void 0:l.options)==null?void 0:u.firstWeekContainsDate)??n.firstWeekContainsDate??((f=(c=n.locale)==null?void 0:c.options)==null?void 0:f.firstWeekContainsDate)??1,s=a1(t,e),i=zs(t,0);return i.setFullYear(s,0,r),i.setHours(0,0,0,0),$a(i,e)}function $j(t,e){const n=vn(t),r=+$a(n,e)-+Bj(n,e);return Math.round(r/r1)+1}function he(t,e){const n=t<0?"-":"",r=Math.abs(t).toString().padStart(e,"0");return n+r}const mr={y(t,e){const n=t.getFullYear(),r=n>0?n:1-n;return he(e==="yy"?r%100:r,e.length)},M(t,e){const n=t.getMonth();return e==="M"?String(n+1):he(n+1,2)},d(t,e){return he(t.getDate(),e.length)},a(t,e){const n=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.toUpperCase();case"aaa":return n;case"aaaaa":return n[0];case"aaaa":default:return n==="am"?"a.m.":"p.m."}},h(t,e){return he(t.getHours()%12||12,e.length)},H(t,e){return he(t.getHours(),e.length)},m(t,e){return he(t.getMinutes(),e.length)},s(t,e){return he(t.getSeconds(),e.length)},S(t,e){const n=e.length,r=t.getMilliseconds(),s=Math.trunc(r*Math.pow(10,n-3));return he(s,e.length)}},oi={midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},m0={G:function(t,e,n){const r=t.getFullYear()>0?1:0;switch(e){case"G":case"GG":case"GGG":return n.era(r,{width:"abbreviated"});case"GGGGG":return n.era(r,{width:"narrow"});case"GGGG":default:return n.era(r,{width:"wide"})}},y:function(t,e,n){if(e==="yo"){const r=t.getFullYear(),s=r>0?r:1-r;return n.ordinalNumber(s,{unit:"year"})}return mr.y(t,e)},Y:function(t,e,n,r){const s=a1(t,r),i=s>0?s:1-s;if(e==="YY"){const o=i%100;return he(o,2)}return e==="Yo"?n.ordinalNumber(i,{unit:"year"}):he(i,e.length)},R:function(t,e){const n=o1(t);return he(n,e.length)},u:function(t,e){const n=t.getFullYear();return he(n,e.length)},Q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"Q":return String(r);case"QQ":return he(r,2);case"Qo":return n.ordinalNumber(r,{unit:"quarter"});case"QQQ":return n.quarter(r,{width:"abbreviated",context:"formatting"});case"QQQQQ":return n.quarter(r,{width:"narrow",context:"formatting"});case"QQQQ":default:return n.quarter(r,{width:"wide",context:"formatting"})}},q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"q":return String(r);case"qq":return he(r,2);case"qo":return n.ordinalNumber(r,{unit:"quarter"});case"qqq":return n.quarter(r,{width:"abbreviated",context:"standalone"});case"qqqqq":return n.quarter(r,{width:"narrow",context:"standalone"});case"qqqq":default:return n.quarter(r,{width:"wide",context:"standalone"})}},M:function(t,e,n){const r=t.getMonth();switch(e){case"M":case"MM":return mr.M(t,e);case"Mo":return n.ordinalNumber(r+1,{unit:"month"});case"MMM":return n.month(r,{width:"abbreviated",context:"formatting"});case"MMMMM":return n.month(r,{width:"narrow",context:"formatting"});case"MMMM":default:return n.month(r,{width:"wide",context:"formatting"})}},L:function(t,e,n){const r=t.getMonth();switch(e){case"L":return String(r+1);case"LL":return he(r+1,2);case"Lo":return n.ordinalNumber(r+1,{unit:"month"});case"LLL":return n.month(r,{width:"abbreviated",context:"standalone"});case"LLLLL":return n.month(r,{width:"narrow",context:"standalone"});case"LLLL":default:return n.month(r,{width:"wide",context:"standalone"})}},w:function(t,e,n,r){const s=$j(t,r);return e==="wo"?n.ordinalNumber(s,{unit:"week"}):he(s,e.length)},I:function(t,e,n){const r=Uj(t);return e==="Io"?n.ordinalNumber(r,{unit:"week"}):he(r,e.length)},d:function(t,e,n){return e==="do"?n.ordinalNumber(t.getDate(),{unit:"date"}):mr.d(t,e)},D:function(t,e,n){const r=Fj(t);return e==="Do"?n.ordinalNumber(r,{unit:"dayOfYear"}):he(r,e.length)},E:function(t,e,n){const r=t.getDay();switch(e){case"E":case"EE":case"EEE":return n.day(r,{width:"abbreviated",context:"formatting"});case"EEEEE":return n.day(r,{width:"narrow",context:"formatting"});case"EEEEEE":return n.day(r,{width:"short",context:"formatting"});case"EEEE":default:return n.day(r,{width:"wide",context:"formatting"})}},e:function(t,e,n,r){const s=t.getDay(),i=(s-r.weekStartsOn+8)%7||7;switch(e){case"e":return String(i);case"ee":return he(i,2);case"eo":return n.ordinalNumber(i,{unit:"day"});case"eee":return n.day(s,{width:"abbreviated",context:"formatting"});case"eeeee":return n.day(s,{width:"narrow",context:"formatting"});case"eeeeee":return n.day(s,{width:"short",context:"formatting"});case"eeee":default:return n.day(s,{width:"wide",context:"formatting"})}},c:function(t,e,n,r){const s=t.getDay(),i=(s-r.weekStartsOn+8)%7||7;switch(e){case"c":return String(i);case"cc":return he(i,e.length);case"co":return n.ordinalNumber(i,{unit:"day"});case"ccc":return n.day(s,{width:"abbreviated",context:"standalone"});case"ccccc":return n.day(s,{width:"narrow",context:"standalone"});case"cccccc":return n.day(s,{width:"short",context:"standalone"});case"cccc":default:return n.day(s,{width:"wide",context:"standalone"})}},i:function(t,e,n){const r=t.getDay(),s=r===0?7:r;switch(e){case"i":return String(s);case"ii":return he(s,e.length);case"io":return n.ordinalNumber(s,{unit:"day"});case"iii":return n.day(r,{width:"abbreviated",context:"formatting"});case"iiiii":return n.day(r,{width:"narrow",context:"formatting"});case"iiiiii":return n.day(r,{width:"short",context:"formatting"});case"iiii":default:return n.day(r,{width:"wide",context:"formatting"})}},a:function(t,e,n){const s=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.dayPeriod(s,{width:"abbreviated",context:"formatting"});case"aaa":return n.dayPeriod(s,{width:"abbreviated",context:"formatting"}).toLowerCase();case"aaaaa":return n.dayPeriod(s,{width:"narrow",context:"formatting"});case"aaaa":default:return n.dayPeriod(s,{width:"wide",context:"formatting"})}},b:function(t,e,n){const r=t.getHours();let s;switch(r===12?s=oi.noon:r===0?s=oi.midnight:s=r/12>=1?"pm":"am",e){case"b":case"bb":return n.dayPeriod(s,{width:"abbreviated",context:"formatting"});case"bbb":return n.dayPeriod(s,{width:"abbreviated",context:"formatting"}).toLowerCase();case"bbbbb":return n.dayPeriod(s,{width:"narrow",context:"formatting"});case"bbbb":default:return n.dayPeriod(s,{width:"wide",context:"formatting"})}},B:function(t,e,n){const r=t.getHours();let s;switch(r>=17?s=oi.evening:r>=12?s=oi.afternoon:r>=4?s=oi.morning:s=oi.night,e){case"B":case"BB":case"BBB":return n.dayPeriod(s,{width:"abbreviated",context:"formatting"});case"BBBBB":return n.dayPeriod(s,{width:"narrow",context:"formatting"});case"BBBB":default:return n.dayPeriod(s,{width:"wide",context:"formatting"})}},h:function(t,e,n){if(e==="ho"){let r=t.getHours()%12;return r===0&&(r=12),n.ordinalNumber(r,{unit:"hour"})}return mr.h(t,e)},H:function(t,e,n){return e==="Ho"?n.ordinalNumber(t.getHours(),{unit:"hour"}):mr.H(t,e)},K:function(t,e,n){const r=t.getHours()%12;return e==="Ko"?n.ordinalNumber(r,{unit:"hour"}):he(r,e.length)},k:function(t,e,n){let r=t.getHours();return r===0&&(r=24),e==="ko"?n.ordinalNumber(r,{unit:"hour"}):he(r,e.length)},m:function(t,e,n){return e==="mo"?n.ordinalNumber(t.getMinutes(),{unit:"minute"}):mr.m(t,e)},s:function(t,e,n){return e==="so"?n.ordinalNumber(t.getSeconds(),{unit:"second"}):mr.s(t,e)},S:function(t,e){return mr.S(t,e)},X:function(t,e,n){const r=t.getTimezoneOffset();if(r===0)return"Z";switch(e){case"X":return y0(r);case"XXXX":case"XX":return gs(r);case"XXXXX":case"XXX":default:return gs(r,":")}},x:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"x":return y0(r);case"xxxx":case"xx":return gs(r);case"xxxxx":case"xxx":default:return gs(r,":")}},O:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"O":case"OO":case"OOO":return"GMT"+g0(r,":");case"OOOO":default:return"GMT"+gs(r,":")}},z:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"z":case"zz":case"zzz":return"GMT"+g0(r,":");case"zzzz":default:return"GMT"+gs(r,":")}},t:function(t,e,n){const r=Math.trunc(t.getTime()/1e3);return he(r,e.length)},T:function(t,e,n){const r=t.getTime();return he(r,e.length)}};function g0(t,e=""){const n=t>0?"-":"+",r=Math.abs(t),s=Math.trunc(r/60),i=r%60;return i===0?n+String(s):n+String(s)+e+he(i,2)}function y0(t,e){return t%60===0?(t>0?"-":"+")+he(Math.abs(t)/60,2):gs(t,e)}function gs(t,e=""){const n=t>0?"-":"+",r=Math.abs(t),s=he(Math.trunc(r/60),2),i=he(r%60,2);return n+s+e+i}const v0=(t,e)=>{switch(t){case"P":return e.date({width:"short"});case"PP":return e.date({width:"medium"});case"PPP":return e.date({width:"long"});case"PPPP":default:return e.date({width:"full"})}},l1=(t,e)=>{switch(t){case"p":return e.time({width:"short"});case"pp":return e.time({width:"medium"});case"ppp":return e.time({width:"long"});case"pppp":default:return e.time({width:"full"})}},zj=(t,e)=>{const n=t.match(/(P+)(p+)?/)||[],r=n[1],s=n[2];if(!s)return v0(t,e);let i;switch(r){case"P":i=e.dateTime({width:"short"});break;case"PP":i=e.dateTime({width:"medium"});break;case"PPP":i=e.dateTime({width:"long"});break;case"PPPP":default:i=e.dateTime({width:"full"});break}return i.replace("{{date}}",v0(r,e)).replace("{{time}}",l1(s,e))},Wj={p:l1,P:zj},Hj=/^D+$/,qj=/^Y+$/,Gj=["D","DD","YY","YYYY"];function Kj(t){return Hj.test(t)}function Qj(t){return qj.test(t)}function Yj(t,e,n){const r=Xj(t,e,n);if(console.warn(r),Gj.includes(t))throw new RangeError(r)}function Xj(t,e,n){const r=t[0]==="Y"?"years":"days of the month";return`Use \`${t.toLowerCase()}\` instead of \`${t}\` (in \`${e}\`) for formatting ${r} to the input \`${n}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`}const Jj=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,Zj=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,eL=/^'([^]*?)'?$/,tL=/''/g,nL=/[a-zA-Z]/;function vr(t,e,n){var f,m,g,x;const r=md(),s=r.locale??Vj,i=r.firstWeekContainsDate??((m=(f=r.locale)==null?void 0:f.options)==null?void 0:m.firstWeekContainsDate)??1,o=r.weekStartsOn??((x=(g=r.locale)==null?void 0:g.options)==null?void 0:x.weekStartsOn)??0,l=vn(t);if(!sj(l))throw new RangeError("Invalid time value");let u=e.match(Zj).map(A=>{const C=A[0];if(C==="p"||C==="P"){const N=Wj[C];return N(A,s.formatLong)}return A}).join("").match(Jj).map(A=>{if(A==="''")return{isToken:!1,value:"'"};const C=A[0];if(C==="'")return{isToken:!1,value:rL(A)};if(m0[C])return{isToken:!0,value:A};if(C.match(nL))throw new RangeError("Format string contains an unescaped latin alphabet character `"+C+"`");return{isToken:!1,value:A}});s.localize.preprocessor&&(u=s.localize.preprocessor(l,u));const c={firstWeekContainsDate:i,weekStartsOn:o,locale:s};return u.map(A=>{if(!A.isToken)return A.value;const C=A.value;(Qj(C)||Kj(C))&&Yj(C,e,String(t));const N=m0[C[0]];return N(l,C,s.localize,c)}).join("")}function rL(t){const e=t.match(eL);return e?e[1].replace(tL,"'"):t}function ys(t,e){const r=aL(t);let s;if(r.date){const u=lL(r.date,2);s=uL(u.restDateString,u.year)}if(!s||isNaN(s.getTime()))return new Date(NaN);const i=s.getTime();let o=0,l;if(r.time&&(o=cL(r.time),isNaN(o)))return new Date(NaN);if(r.timezone){if(l=dL(r.timezone),isNaN(l))return new Date(NaN)}else{const u=new Date(i+o),c=new Date(0);return c.setFullYear(u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate()),c.setHours(u.getUTCHours(),u.getUTCMinutes(),u.getUTCSeconds(),u.getUTCMilliseconds()),c}return new Date(i+o+l)}const Yl={dateTimeDelimiter:/[T ]/,timeZoneDelimiter:/[Z ]/i,timezone:/([Z+-].*)$/},sL=/^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,iL=/^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,oL=/^([+-])(\d{2})(?::?(\d{2}))?$/;function aL(t){const e={},n=t.split(Yl.dateTimeDelimiter);let r;if(n.length>2)return e;if(/:/.test(n[0])?r=n[0]:(e.date=n[0],r=n[1],Yl.timeZoneDelimiter.test(e.date)&&(e.date=t.split(Yl.timeZoneDelimiter)[0],r=t.substr(e.date.length,t.length))),r){const s=Yl.timezone.exec(r);s?(e.time=r.replace(s[1],""),e.timezone=s[1]):e.time=r}return e}function lL(t,e){const n=new RegExp("^(?:(\\d{4}|[+-]\\d{"+(4+e)+"})|(\\d{2}|[+-]\\d{"+(2+e)+"})$)"),r=t.match(n);if(!r)return{year:NaN,restDateString:""};const s=r[1]?parseInt(r[1]):null,i=r[2]?parseInt(r[2]):null;return{year:i===null?s:i*100,restDateString:t.slice((r[1]||r[2]).length)}}function uL(t,e){if(e===null)return new Date(NaN);const n=t.match(sL);if(!n)return new Date(NaN);const r=!!n[4],s=Mo(n[1]),i=Mo(n[2])-1,o=Mo(n[3]),l=Mo(n[4]),u=Mo(n[5])-1;if(r)return gL(e,l,u)?hL(e,l,u):new Date(NaN);{const c=new Date(0);return!pL(e,i,o)||!mL(e,s)?new Date(NaN):(c.setUTCFullYear(e,i,Math.max(s,o)),c)}}function Mo(t){return t?parseInt(t):1}function cL(t){const e=t.match(iL);if(!e)return NaN;const n=kh(e[1]),r=kh(e[2]),s=kh(e[3]);return yL(n,r,s)?n*i1+r*s1+s*1e3:NaN}function kh(t){return t&&parseFloat(t.replace(",","."))||0}function dL(t){if(t==="Z")return 0;const e=t.match(oL);if(!e)return 0;const n=e[1]==="+"?-1:1,r=parseInt(e[2]),s=e[3]&&parseInt(e[3])||0;return vL(r,s)?n*(r*i1+s*s1):NaN}function hL(t,e,n){const r=new Date(0);r.setUTCFullYear(t,0,4);const s=r.getUTCDay()||7,i=(e-1)*7+n+1-s;return r.setUTCDate(r.getUTCDate()+i),r}const fL=[31,null,31,30,31,30,31,31,30,31,30,31];function u1(t){return t%400===0||t%4===0&&t%100!==0}function pL(t,e,n){return e>=0&&e<=11&&n>=1&&n<=(fL[e]||(u1(t)?29:28))}function mL(t,e){return e>=1&&e<=(u1(t)?366:365)}function gL(t,e,n){return e>=1&&e<=53&&n>=0&&n<=6}function yL(t,e,n){return t===24?e===0&&n===0:n>=0&&n<60&&e>=0&&e<60&&t>=0&&t<25}function vL(t,e){return e>=0&&e<=59}function _L(t){const{app:e}=hd(),n=ur(e);return ED(n,window.location.href)}async function wL(t){const{app:e}=hd(),n=ur(e),r=ud(e);await SD(n,mI);const s=t||window.localStorage.getItem("bb_magic_email")||"";if(!s)throw new Error("Email required to complete sign-in");const i=window.location.href,o=await TD(n,s,i);return window.localStorage.removeItem("bb_magic_email"),await ao(r,"migrateCustomerForEmail")({email:s}),o.user}class EL{constructor(e,n){this.db=e,n&&typeof window<"u"&&(this.messaging=JI(n))}async sendMessage(e){const n={...e,timestamp:xn(),read:!1};return(await Ni(je(this.db,"messages"),n)).id}async getMessages(e,n=50){const r=Ct(je(this.db,"messages"),Tt("customerId","==",e),Hn("timestamp","desc"),Bx(n));return(await Go(r)).docs.map(i=>({id:i.id,...i.data()}))}subscribeToMessages(e,n){const r=Ct(je(this.db,"messages"),Tt("customerId","==",e),Hn("timestamp","asc"));return Xt(r,s=>{const i=s.docs.map(o=>({id:o.id,...o.data()}));n(i)})}async markMessagesAsRead(e,n){const r=Ct(je(this.db,"messages"),Tt("customerId","==",e),Tt("type","==","customer"),Tt("read","==",!1)),i=(await Go(r)).docs.map(o=>yu(o.ref,{read:!0,readBy:n,readAt:xn()}));await Promise.all(i)}async getConversations(){const e=Ct(je(this.db,"conversations"),Hn("lastMessageTime","desc"));return(await Go(e)).docs.map(r=>({id:r.id,...r.data()}))}subscribeToConversations(e){const n=Ct(je(this.db,"conversations"),Hn("lastMessageTime","desc"));return Xt(n,r=>{const s=r.docs.map(i=>({id:i.id,...i.data()}));e(s)})}async updateConversation(e,n){const r=Vs(this.db,"conversations",e);await yu(r,{lastMessage:n.content,lastMessageTime:xn(),unreadCount:n.type==="customer"?await this.getUnreadCount(e)+1:0,status:"active"}).catch(async()=>{await Ni(je(this.db,"conversations"),{customerId:e,customerName:n.customerName,customerEmail:n.customerEmail,lastMessage:n.content,lastMessageTime:xn(),unreadCount:n.type==="customer"?1:0,status:"active",appointmentId:n.appointmentId})})}async getUnreadCount(e){const n=Ct(je(this.db,"messages"),Tt("customerId","==",e),Tt("type","==","customer"),Tt("read","==",!1));return(await Go(n)).size}async requestNotificationPermission(){if(!this.messaging)return null;try{if(await Notification.requestPermission()==="granted")return await CM(this.messaging,{vapidKey:void 0})}catch(e){console.error("Error getting FCM token:",e)}return null}onMessage(e){return this.messaging?NM(this.messaging,e):()=>{}}async saveCustomerToken(e,n){const r=Vs(this.db,"customer_tokens",e);await yu(r,{token:n,updatedAt:xn()}).catch(async()=>{await Ni(je(this.db,"customer_tokens"),{customerId:e,token:n,createdAt:xn(),updatedAt:xn()})})}}const TL=t=>{if(!t)return"";const e=t.toDate?t.toDate():new Date(t),r=(new Date().getTime()-e.getTime())/(1e3*60*60);return r<1?"Just now":r<24?`${Math.floor(r)}h ago`:r<168?`${Math.floor(r/24)}d ago`:e.toLocaleDateString()};function xL({customerId:t,customerName:e,customerEmail:n,appointmentId:r,className:s=""}){const[i,o]=D.useState([]),[l,u]=D.useState(""),[c,f]=D.useState(null),[m,g]=D.useState(!0),[x,A]=D.useState(!1),C=D.useRef(null);D.useEffect(()=>{const{db:y,app:_}=os(),R=new EL(y,_);f(R),R.requestNotificationPermission().then(I=>{I&&R.saveCustomerToken(t,I)});const V=R.subscribeToMessages(t,I=>{o(I),g(!1)}),j=R.onMessage(I=>{console.log("Message received:",I)});return()=>{V(),j()}},[t]),D.useEffect(()=>{N()},[i]);const N=()=>{var y;(y=C.current)==null||y.scrollIntoView({behavior:"smooth"})},E=async()=>{if(!(!l.trim()||!c))try{await c.sendMessage({customerId:t,customerName:e,customerEmail:n,content:l.trim(),type:"customer",priority:"medium",appointmentId:r}),await c.updateConversation(t,{customerId:t,customerName:e,customerEmail:n,content:l.trim(),type:"customer",appointmentId:r}),u("")}catch(y){console.error("Error sending message:",y)}};return m?d.jsx("div",{className:`flex items-center justify-center h-32 ${s}`,children:d.jsx("div",{className:"animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"})}):d.jsxs("div",{className:`bg-white rounded-lg shadow-lg ${s}`,children:[d.jsx("div",{className:"p-4 bg-blue-600 text-white rounded-t-lg cursor-pointer",onClick:()=>A(!x),children:d.jsxs("div",{className:"flex justify-between items-center",children:[d.jsxs("div",{children:[d.jsx("h3",{className:"font-semibold",children:"Message Support"}),d.jsx("p",{className:"text-sm text-blue-100",children:"We're here to help!"})]}),d.jsxs("div",{className:"flex items-center space-x-2",children:[i.some(y=>y.type==="admin"&&!y.read)&&d.jsx("div",{className:"w-2 h-2 bg-red-400 rounded-full"}),d.jsx("svg",{className:`w-5 h-5 transform transition-transform ${x?"rotate-180":""}`,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]})]})}),!x&&d.jsxs(d.Fragment,{children:[d.jsxs("div",{className:"h-64 overflow-y-auto p-4 space-y-3",children:[i.length===0?d.jsxs("div",{className:"text-center text-gray-500 py-8",children:[d.jsx("svg",{className:"w-12 h-12 mx-auto mb-4 text-gray-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"})}),d.jsx("p",{children:"No messages yet. Start a conversation!"})]}):i.map(y=>d.jsx("div",{className:`flex ${y.type==="customer"?"justify-end":"justify-start"}`,children:d.jsxs("div",{className:`max-w-xs px-3 py-2 rounded-lg ${y.type==="customer"?"bg-blue-600 text-white":"bg-gray-200 text-gray-900"}`,children:[d.jsx("p",{className:"text-sm",children:y.content}),d.jsx("p",{className:`text-xs mt-1 ${y.type==="customer"?"text-blue-100":"text-gray-500"}`,children:TL(y.timestamp)})]})},y.id)),d.jsx("div",{ref:C})]}),d.jsxs("div",{className:"p-4 border-t border-gray-200",children:[d.jsxs("div",{className:"flex space-x-2",children:[d.jsx("input",{type:"text",value:l,onChange:y=>u(y.target.value),onKeyPress:y=>y.key==="Enter"&&E(),placeholder:"Type your message...",className:"flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"}),d.jsx("button",{onClick:E,disabled:!l.trim(),className:"px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm",children:"Send"})]}),d.jsx("p",{className:"text-xs text-gray-500 mt-2",children:"💡 Tip: Ask about appointments, services, or any questions you have!"})]})]})]})}function IL(){const{db:t}=os(),e=to(),n=ur(),[r,s]=D.useState([]),[i,o]=D.useState(null);D.useEffect(()=>e1(t,{activeOnly:!0},s),[]),D.useEffect(()=>MM(t,o),[]);const[l,u]=D.useState([]),c=D.useMemo(()=>r.filter(B=>l.includes(B.id)),[r,l]),f=D.useMemo(()=>c.reduce((B,te)=>B+te.duration,0),[c]),m=D.useMemo(()=>c.reduce((B,te)=>B+te.price,0),[c]),g=D.useMemo(()=>{const B={};return r.forEach(te=>{const Be=te.category||"Other Services";B[Be]||(B[Be]=[]),B[Be].push(te)}),B},[r]),[x,A]=D.useState(()=>new Date().toISOString().slice(0,10)),C=D.useMemo(()=>new Date(x+"T00:00:00"),[x]);D.useEffect(()=>{if(i&&c.length>0){const B=WM(i);if(B){const te=B.toISOString().slice(0,10);A(te)}}},[i,c]);const[N,E]=D.useState([]);D.useEffect(()=>OM(t,C,E),[C]);const y=D.useMemo(()=>i&&c.length>0?UM(C,f,i,N).map(B=>({startISO:B,resourceId:null})):[],[i,c,f,N,C]),_=D.useMemo(JM,[]),[R,V]=D.useState(null),[j,I]=D.useState(null),[w,S]=D.useState(""),[T,b]=D.useState(""),P=D.useRef(null);D.useEffect(()=>{if(!j){P.current&&window.clearInterval(P.current),b("");return}const B=()=>{const te=new Date(j.expiresAt).getTime()-Date.now();if(te<=0){P.current&&window.clearInterval(P.current),b("0:00");return}const Be=Math.floor(te/6e4),lo=Math.floor(te%6e4/1e3).toString().padStart(2,"0");b(`${Be}:${lo}`)};return B(),P.current=window.setInterval(B,1e3),()=>{P.current&&window.clearInterval(P.current)}},[j]);async function k(B){S(""),V(B);try{const te=await QM({serviceId:c[0].id,startISO:B.startISO,durationMinutes:f,sessionId:_,resourceId:B.resourceId??null});I({id:te.id,expiresAt:te.expiresAt}),console.log("Hold updated:",te.id)}catch(te){S((te==null?void 0:te.message)==="E_OVERLAP"?"This time is no longer available.":(te==null?void 0:te.message)||"Failed to hold slot."),V(null)}}const[J,yt]=D.useState(null);D.useEffect(()=>ol(n,yt),[n]);const[rn,At]=D.useState(!1),[z,Q]=D.useState("");D.useEffect(()=>{const B=_L();if(At(B),B){const te=window.localStorage.getItem("bb_magic_email");te&&Q(te)}},[]);const[Z,pe]=D.useState(!1),[oe,xe]=D.useState(""),[He,sn]=D.useState(""),[nt,on]=D.useState(""),[ll,gd]=D.useState(!1);async function Zs(){if(J!=null&&J.email)return(await d0({email:J.email,name:J.displayName||"Customer",phone:null})).customerId;if(He){const B=await d0({email:He,name:oe||"Guest",phone:nt||null});if(ll&&nt)try{await t.collection("sms_consents").add({customerId:B.customerId,phone:nt,consentMethod:"booking_form",timestamp:new Date().toISOString(),status:"active",source:"booking_form"})}catch(te){console.error("Failed to log SMS consent:",te)}return B.customerId}throw new Error("Missing customer email.")}async function as(){if(!(!j||l.length===0||!R)){if(S(""),!J&&!He){S("Please sign in or fill out the guest form below."),pe(!0);return}try{console.log("Starting finalizeBooking...",{user:J==null?void 0:J.email,gEmail:He,gName:oe}),!J&&rn&&z&&(console.log("Completing magic link sign in..."),await wL(z),window.history.replaceState({},document.title,window.location.pathname)),console.log("Ensuring customer ID...");const B=await Zs();console.log("Customer ID obtained:",B),console.log("Calling finalizeBookingFromHoldClient...",{holdId:j.id,customerId:B,customer:{name:(J==null?void 0:J.displayName)||oe||null,email:(J==null?void 0:J.email)||He||null,phone:nt||null},price:m});const te=await YM({holdId:j.id,customerId:B,customer:{name:(J==null?void 0:J.displayName)||oe||null,email:(J==null?void 0:J.email)||He||null,phone:nt||null},price:m,autoConfirm:!0});console.log("Booking finalized successfully:",te),e(`/confirmation?id=${encodeURIComponent(te.appointmentId)}`)}catch(B){console.error("finalizeBooking error:",B),S((B==null?void 0:B.message)==="E_OVERLAP"?"This time is no longer available.":(B==null?void 0:B.message)||"Failed to finalize booking.");try{j&&await XM(j.id)}catch{}I(null)}}}const ls=B=>vr(ys(B),"h:mm a"),jn=j?new Date(j.expiresAt).getTime()<=Date.now():!1;return d.jsxs("div",{className:"relative",children:[d.jsxs("section",{className:"grid gap-6",children:[d.jsx("h1",{className:"font-serif text-2xl",children:"Book an appointment"}),d.jsxs("div",{className:"rounded-xl bg-white p-6 shadow-soft",children:[d.jsx("h2",{className:"mb-4 font-serif text-xl",children:"1. Choose Your Service(s)"}),d.jsx("p",{className:"mb-6 text-sm text-slate-600",children:"Select one or more services. You can combine multiple treatments in a single appointment."}),d.jsx("div",{className:"space-y-6",children:Object.entries(g).map(([B,te])=>d.jsxs("div",{children:[d.jsxs("h3",{className:"mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800",children:[d.jsx("span",{className:"h-px flex-grow bg-gradient-to-r from-terracotta/40 to-transparent"}),d.jsx("span",{children:B}),d.jsx("span",{className:"h-px flex-grow bg-gradient-to-l from-terracotta/40 to-transparent"})]}),d.jsx("div",{className:"grid gap-4 sm:grid-cols-2",children:te.map(Be=>d.jsx("label",{className:`group cursor-pointer rounded-xl border-2 p-4 transition-all ${l.includes(Be.id)?"border-terracotta bg-terracotta/5 shadow-md":"border-slate-200 hover:border-terracotta/40 hover:bg-cream/50"}`,children:d.jsxs("div",{className:"flex gap-3",children:[d.jsx("div",{className:"flex-shrink-0 pt-1",children:d.jsx("input",{type:"checkbox",checked:l.includes(Be.id),onChange:lo=>{lo.target.checked?u(uo=>[...uo,Be.id]):u(uo=>uo.filter(ul=>ul!==Be.id)),V(null),I(null),S("")},className:"h-5 w-5 rounded border-slate-300 text-terracotta focus:ring-terracotta cursor-pointer"})}),d.jsxs("div",{className:"flex-grow",children:[d.jsx("div",{className:"mb-1 flex items-start justify-between",children:d.jsx("h4",{className:"font-semibold text-slate-900",children:Be.name})}),Be.description&&d.jsx("p",{className:"mb-2 text-sm text-slate-600",children:Be.description}),d.jsxs("div",{className:"flex items-center gap-3 text-sm",children:[d.jsxs("span",{className:"inline-flex items-center gap-1 text-slate-700",children:[d.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})}),Be.duration," min"]}),d.jsxs("span",{className:"inline-flex items-center gap-1 font-semibold text-terracotta",children:[d.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),"$",Be.price.toFixed(2)]})]})]})]})},Be.id))})]},B))}),c.length>0&&d.jsxs("div",{className:"mt-6 rounded-xl bg-gradient-to-br from-terracotta/10 to-cream/50 p-5 border-2 border-terracotta/30",children:[d.jsxs("div",{className:"mb-3 flex items-center gap-2",children:[d.jsx("svg",{className:"h-5 w-5 text-terracotta",fill:"currentColor",viewBox:"0 0 20 20",children:d.jsx("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",clipRule:"evenodd"})}),d.jsxs("h4",{className:"font-semibold text-slate-900",children:["Your Selection (",c.length," ",c.length===1?"Service":"Services",")"]})]}),d.jsx("div",{className:"mb-4 space-y-2",children:c.map(B=>d.jsxs("div",{className:"flex items-center justify-between rounded-lg bg-white/60 px-3 py-2",children:[d.jsx("span",{className:"font-medium text-slate-800",children:B.name}),d.jsxs("div",{className:"flex items-center gap-3 text-sm text-slate-600",children:[d.jsxs("span",{children:[B.duration,"m"]}),d.jsxs("span",{className:"font-semibold text-terracotta",children:["$",B.price.toFixed(2)]})]})]},B.id))}),d.jsxs("div",{className:"rounded-lg bg-white/80 p-3 space-y-2",children:[d.jsxs("div",{className:"flex items-center justify-between text-sm",children:[d.jsx("span",{className:"text-slate-600",children:"Total Duration:"}),d.jsxs("span",{className:"font-semibold text-slate-900",children:[f," minutes"]})]}),d.jsxs("div",{className:"flex items-center justify-between border-t border-slate-200 pt-2",children:[d.jsx("span",{className:"font-semibold text-slate-900",children:"Total Price:"}),d.jsxs("span",{className:"text-xl font-bold text-terracotta",children:["$",m.toFixed(2)]})]})]})]})]}),d.jsxs("div",{className:"rounded-xl bg-white p-4 shadow-soft",children:[d.jsx("h2",{className:"mb-2 font-medium",children:"2. Pick date & time"}),i&&d.jsx("div",{className:"mb-3 p-3 bg-slate-50 rounded-lg border-l-4 border-terracotta",children:d.jsxs("div",{className:"text-sm text-slate-700",children:[d.jsx("div",{className:"font-medium text-slate-900 mb-1",children:C.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}),d.jsx("div",{className:"text-slate-600",children:Tu(C,i)?d.jsxs(d.Fragment,{children:[d.jsxs("span",{className:"inline-flex items-center gap-1",children:[d.jsx("span",{className:"w-2 h-2 bg-green-500 rounded-full"}),"Open: ",GM(C,i)]}),C.toDateString()===new Date().toDateString()&&KM(i)&&d.jsx("span",{className:"ml-2 text-green-600 font-medium",children:"• Currently Open"})]}):d.jsxs("span",{className:"inline-flex items-center gap-1 text-red-600",children:[d.jsx("span",{className:"w-2 h-2 bg-red-500 rounded-full"}),"Closed"]})})]})}),d.jsxs("div",{className:"mb-3 flex flex-wrap items-center gap-3",children:[d.jsxs("label",{className:"text-sm text-slate-600",children:["Date",d.jsx("input",{type:"date",className:"ml-2 rounded-md border p-2",value:x,min:new Date().toISOString().slice(0,10),max:(()=>{const B=new Date;return B.setDate(B.getDate()+90),B.toISOString().slice(0,10)})(),onChange:B=>{B.target.value+"",A(B.target.value),V(null),j&&I(null),S("")}})]}),c.length>0&&d.jsxs("div",{className:"text-sm text-slate-600",children:["Duration: ",f," min",c.length>1&&d.jsxs("span",{className:"ml-2 text-xs text-slate-500",children:["(",c.length," services)"]})]})]}),d.jsx("div",{className:"max-h-96 overflow-y-auto border rounded-lg p-2",children:d.jsxs("div",{className:"grid grid-cols-4 gap-2",children:[y.map(B=>d.jsx("button",{onClick:()=>k(B),className:`rounded-md border py-2 text-sm ${(R==null?void 0:R.startISO)===B.startISO?"bg-terracotta text-white":"hover:bg-cream"}`,children:ls(B.startISO)},B.startISO)),!y.length&&d.jsxs("div",{className:"col-span-4 text-center py-8 text-slate-500",children:[d.jsx("div",{className:"text-4xl mb-2",children:"📅"}),d.jsx("p",{className:"text-sm",children:i?c.length===0?"Please select at least one service first":Tu(C,i)?"No available time slots for this date":d.jsxs(d.Fragment,{children:[d.jsx("span",{className:"text-red-600",children:"Sorry, we are closed on this date."}),(()=>{const B=HM(C,i);if(B){const te=qM(B);return d.jsxs("span",{className:"block mt-1",children:["Our next available day is ",d.jsx("span",{className:"font-medium text-slate-700",children:te}),"."]})}return null})()]}):"Loading availability..."}),!Tu(C,i)&&d.jsx("p",{className:"text-xs mt-2 text-slate-400",children:"Please select a date when we are open for business"})]})]})}),R&&c.length>0&&d.jsxs("div",{className:"mt-4 rounded-2xl border border-terracotta/40 bg-cream/60 p-4",children:[d.jsxs("div",{className:"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",children:[d.jsxs("div",{children:[d.jsx("div",{className:"text-sm text-slate-600",children:"You’re holding"}),d.jsx("div",{className:"font-serif text-lg",children:c.length===1?`${c[0].name} • ${ls(R.startISO)}`:`${c.length} Services • ${ls(R.startISO)}`}),c.length>1&&d.jsx("div",{className:"text-xs text-slate-500 mt-1",children:c.map(B=>B.name).join(", ")}),d.jsx("div",{className:`text-xs ${jn?"text-red-600":"text-slate-500"}`,children:j?jn?"Hold expired":`Hold expires in ${T}`:"Creating hold…"})]}),d.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row sm:items-center",children:[!J&&rn&&d.jsx("input",{className:"w-56 rounded-md border p-2",placeholder:"your@email.com",value:z,onChange:B=>Q(B.target.value),inputMode:"email",autoComplete:"email","aria-label":"Email for verification"}),d.jsx("button",{className:"rounded-xl bg-terracotta px-4 py-2 text-white disabled:opacity-60",onClick:()=>void as(),disabled:!j||jn,children:"Book now"}),d.jsx("button",{className:"rounded-xl border border-terracotta/60 px-4 py-2 text-terracotta disabled:opacity-60",onClick:()=>pe(B=>!B),disabled:!j||jn,children:"Book as guest"})]})]}),Z&&j&&!jn&&d.jsxs("div",{className:"mt-3 grid gap-3",children:[d.jsxs("div",{className:"grid gap-2 sm:grid-cols-3",children:[d.jsx("input",{className:"rounded-md border p-2",placeholder:"Full name",value:oe,onChange:B=>xe(B.target.value)}),d.jsx("input",{className:"rounded-md border p-2",placeholder:"Email",value:He,onChange:B=>sn(B.target.value),inputMode:"email",autoComplete:"email"}),d.jsx("input",{className:"rounded-md border p-2",placeholder:"Phone",value:nt,onChange:B=>on(B.target.value),inputMode:"tel",autoComplete:"tel"})]}),d.jsx("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-3",children:d.jsxs("label",{className:"flex items-start gap-2 cursor-pointer",children:[d.jsx("input",{type:"checkbox",checked:ll,onChange:B=>gd(B.target.checked),className:"mt-1"}),d.jsxs("span",{className:"text-xs text-slate-700",children:[d.jsx("strong",{children:"Opt-in to SMS messages:"})," I agree to receive automated text messages from Bueno Brows at ",d.jsx("strong",{children:"(650) 613-8455"})," for appointment confirmations, reminders, and updates. Message frequency varies. Message and data rates may apply. Reply ",d.jsx("strong",{children:"STOP"})," to opt out anytime, ",d.jsx("strong",{children:"HELP"})," for assistance. Responses may be automated by our AI assistant."]})]})}),d.jsx("div",{className:"flex justify-end",children:d.jsx("button",{className:"rounded-md bg-terracotta px-4 py-2 text-white disabled:opacity-60",onClick:()=>void as(),disabled:!oe||!He,children:"Confirm guest booking"})})]})]})]}),w&&d.jsx("div",{className:"text-sm text-red-600",role:"alert","aria-live":"polite",children:w})]}),J&&d.jsx("div",{className:"fixed bottom-4 right-4 w-80 z-50",children:d.jsx(xL,{customerId:J.uid,customerName:J.displayName||"Customer",customerEmail:J.email||"",appointmentId:j==null?void 0:j.id})})]})}function SL(){const{db:t}=os(),e=ur(),[n,r]=D.useState(null),[s,i]=D.useState([]),[o,l]=D.useState(!0),[u,c]=D.useState(!1),[f,m]=D.useState(!1),[g,x]=D.useState({name:"",email:"",rating:5,comment:"",serviceName:""});D.useEffect(()=>{const N=ol(e,E=>{r(E),E&&x(y=>({...y,name:E.displayName||"",email:E.email||""}))});return()=>N()},[e]),D.useEffect(()=>{const N=Ct(je(t,"reviews"),Hn("createdAt","desc"),Bx(20)),E=Xt(N,y=>{const _=y.docs.map(R=>({id:R.id,...R.data()})).filter(R=>R.isApproved!==!1);i(_),l(!1)},y=>{console.error("Error fetching reviews:",y),l(!1)});return()=>E()},[t]);const A=async N=>{if(N.preventDefault(),!(!g.name||!g.comment)){c(!0);try{await Ni(je(t,"reviews"),{...g,createdAt:xn(),isApproved:!1}),x({name:"",email:"",rating:5,comment:"",serviceName:""}),m(!1),alert("Thank you for your review! It will be published after approval.")}catch(E){console.error("Error submitting review:",E),alert("Error submitting review. Please try again.")}finally{c(!1)}}},C=N=>Array.from({length:5},(E,y)=>d.jsx("span",{className:`text-2xl ${y<N?"text-yellow-400":"text-gray-300"}`,children:"★"},y));return o?d.jsx("div",{className:"min-h-screen flex items-center justify-center",children:d.jsxs("div",{className:"text-center",children:[d.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"}),d.jsx("p",{className:"text-slate-600",children:"Loading reviews..."})]})}):d.jsxs("div",{className:"max-w-4xl mx-auto",children:[d.jsxs("div",{className:"text-center mb-12",children:[d.jsx("h1",{className:"font-serif text-4xl text-terracotta mb-4",children:"Client Reviews"}),d.jsx("p",{className:"text-slate-600 text-lg max-w-2xl mx-auto",children:"See what our amazing clients have to say about their experience at Bueno Brows"})]}),s.length>0&&d.jsx("div",{className:"bg-white rounded-xl shadow-soft p-6 mb-8",children:d.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 text-center",children:[d.jsxs("div",{children:[d.jsx("div",{className:"text-3xl font-bold text-terracotta mb-2",children:s.length}),d.jsx("div",{className:"text-slate-600",children:"Total Reviews"})]}),d.jsxs("div",{children:[d.jsx("div",{className:"text-3xl font-bold text-terracotta mb-2",children:(s.reduce((N,E)=>N+E.rating,0)/s.length).toFixed(1)}),d.jsx("div",{className:"text-slate-600",children:"Average Rating"})]}),d.jsxs("div",{children:[d.jsx("div",{className:"text-3xl font-bold text-terracotta mb-2",children:C(Math.round(s.reduce((N,E)=>N+E.rating,0)/s.length))}),d.jsx("div",{className:"text-slate-600",children:"Overall Rating"})]})]})}),s.length>0?d.jsx("div",{className:"grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12",children:s.map(N=>d.jsxs("div",{className:"bg-white rounded-xl shadow-soft p-6",children:[d.jsxs("div",{className:"flex items-center justify-between mb-3",children:[d.jsx("div",{className:"flex items-center",children:C(N.rating)}),d.jsx("div",{className:"text-sm text-slate-500",children:N.createdAt&&vr(N.createdAt.toDate(),"MMM d, yyyy")})]}),d.jsxs("blockquote",{className:"text-slate-700 mb-4 italic",children:['"',N.comment,'"']}),d.jsxs("div",{className:"border-t pt-4",children:[d.jsx("div",{className:"font-medium text-slate-900",children:N.customerName}),N.serviceName&&d.jsx("div",{className:"text-sm text-slate-500",children:N.serviceName})]})]},N.id))}):d.jsxs("div",{className:"text-center py-12",children:[d.jsx("div",{className:"text-6xl mb-4",children:"⭐"}),d.jsx("h3",{className:"text-xl font-medium text-slate-700 mb-2",children:"No reviews yet"}),d.jsx("p",{className:"text-slate-500",children:"Be the first to share your experience!"})]}),d.jsx("div",{className:"text-center",children:f?d.jsxs("div",{className:"bg-white rounded-xl shadow-soft p-6 max-w-2xl mx-auto",children:[d.jsx("h3",{className:"text-xl font-medium mb-4",children:"Share Your Experience"}),d.jsxs("form",{onSubmit:A,className:"space-y-4",children:[d.jsxs("div",{className:"grid md:grid-cols-2 gap-4",children:[d.jsxs("div",{children:[d.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Your Name *"}),d.jsx("input",{type:"text",required:!0,value:g.name,onChange:N=>x(E=>({...E,name:N.target.value})),className:"w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"})]}),d.jsxs("div",{children:[d.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Email"}),d.jsx("input",{type:"email",value:g.email,onChange:N=>x(E=>({...E,email:N.target.value})),className:"w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"})]})]}),d.jsxs("div",{children:[d.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Service (Optional)"}),d.jsx("input",{type:"text",value:g.serviceName,onChange:N=>x(E=>({...E,serviceName:N.target.value})),placeholder:"e.g., Brow Fill, Lash Extensions",className:"w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"})]}),d.jsxs("div",{children:[d.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Rating"}),d.jsx("div",{className:"flex items-center gap-1",children:Array.from({length:5},(N,E)=>d.jsx("button",{type:"button",onClick:()=>x(y=>({...y,rating:E+1})),className:`text-2xl ${E<g.rating?"text-yellow-400":"text-gray-300"} hover:text-yellow-400 transition-colors`,children:"★"},E))})]}),d.jsxs("div",{children:[d.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Your Review *"}),d.jsx("textarea",{required:!0,rows:4,value:g.comment,onChange:N=>x(E=>({...E,comment:N.target.value})),placeholder:"Tell us about your experience...",className:"w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"})]}),d.jsxs("div",{className:"flex gap-3 pt-4",children:[d.jsx("button",{type:"submit",disabled:u,className:"bg-terracotta text-white px-6 py-2 rounded-lg hover:bg-terracotta/90 transition-colors font-medium disabled:opacity-50",children:u?"Submitting...":"Submit Review"}),d.jsx("button",{type:"button",onClick:()=>m(!1),className:"px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors",children:"Cancel"})]})]})]}):d.jsx("button",{onClick:()=>m(!0),className:"bg-terracotta text-white px-8 py-3 rounded-lg hover:bg-terracotta/90 transition-colors font-medium",children:"Write a Review"})})]})}function AL(){const{state:t}=eo();return d.jsxs("section",{className:"grid gap-2",children:[d.jsx("h2",{className:"text-2xl font-serif text-green-700",children:"Confirmed!"}),d.jsxs("p",{children:["Your appointment is booked",t!=null&&t.serviceName?` for ${t.serviceName}`:"",t!=null&&t.when?` at ${t.when}`:"","."]}),d.jsx("p",{children:"We emailed your details and attached a calendar file (.ics)."}),d.jsx(As,{to:"/",className:"text-terracotta underline",children:"Back to home"})]})}function kL(){const{db:t}=os(),e=ur(),n=to(),[r,s]=D.useState(!1),[i,o]=D.useState(""),[l,u]=D.useState(""),[c,f]=D.useState(""),[m,g]=D.useState(""),[x,A]=D.useState(!1),C=async E=>{E.preventDefault(),g(""),A(!0);try{if(r){const y=await _D(e,i,l);c&&y.user&&await ID(y.user,{displayName:c})}else await wD(e,i,l);n("/book")}catch(y){g(y.message||"Authentication failed")}finally{A(!1)}},N=async()=>{g(""),A(!0);try{const E=new $n;await GD(e,E),n("/book")}catch(E){g(E.message||"Google sign-in failed")}finally{A(!1)}};return d.jsx("div",{className:"min-h-screen flex items-center justify-center bg-gradient-to-br from-terracotta/10 to-cream/30 py-12 px-4 sm:px-6 lg:px-8",children:d.jsxs("div",{className:"max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl",children:[d.jsxs("div",{children:[d.jsx("h2",{className:"text-center text-3xl font-serif text-terracotta",children:r?"Create Account":"Welcome Back"}),d.jsx("p",{className:"mt-2 text-center text-sm text-slate-600",children:r?"Sign up to manage your appointments":"Sign in to view and manage your bookings"})]}),d.jsxs("form",{className:"mt-8 space-y-6",onSubmit:C,children:[r&&d.jsxs("div",{children:[d.jsx("label",{htmlFor:"name",className:"block text-sm font-medium text-slate-700",children:"Full Name"}),d.jsx("input",{id:"name",name:"name",type:"text",required:r,value:c,onChange:E=>f(E.target.value),className:"mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta",placeholder:"John Doe"})]}),d.jsxs("div",{children:[d.jsx("label",{htmlFor:"email",className:"block text-sm font-medium text-slate-700",children:"Email Address"}),d.jsx("input",{id:"email",name:"email",type:"email",autoComplete:"email",required:!0,value:i,onChange:E=>o(E.target.value),className:"mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta",placeholder:"you@example.com"})]}),d.jsxs("div",{children:[d.jsx("label",{htmlFor:"password",className:"block text-sm font-medium text-slate-700",children:"Password"}),d.jsx("input",{id:"password",name:"password",type:"password",autoComplete:r?"new-password":"current-password",required:!0,value:l,onChange:E=>u(E.target.value),className:"mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-terracotta focus:border-terracotta",placeholder:"••••••••"})]}),m&&d.jsx("div",{className:"rounded-md bg-red-50 p-4",children:d.jsx("p",{className:"text-sm text-red-800",children:m})}),d.jsx("button",{type:"submit",disabled:x,className:"w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-terracotta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50",children:x?"Please wait...":r?"Sign Up":"Sign In"})]}),d.jsxs("div",{className:"mt-6",children:[d.jsxs("div",{className:"relative",children:[d.jsx("div",{className:"absolute inset-0 flex items-center",children:d.jsx("div",{className:"w-full border-t border-slate-300"})}),d.jsx("div",{className:"relative flex justify-center text-sm",children:d.jsx("span",{className:"px-2 bg-white text-slate-500",children:"Or continue with"})})]}),d.jsxs("button",{type:"button",onClick:N,disabled:x,className:"mt-4 w-full flex items-center justify-center gap-3 py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50",children:[d.jsxs("svg",{className:"w-5 h-5",viewBox:"0 0 24 24",children:[d.jsx("path",{fill:"currentColor",d:"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"}),d.jsx("path",{fill:"currentColor",d:"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"}),d.jsx("path",{fill:"currentColor",d:"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"}),d.jsx("path",{fill:"currentColor",d:"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"})]}),"Continue with Google"]})]}),d.jsx("div",{className:"text-center",children:d.jsx("button",{type:"button",onClick:()=>s(!r),className:"text-sm text-terracotta hover:text-terracotta/80",children:r?"Already have an account? Sign in":"Don't have an account? Sign up"})}),d.jsx("div",{className:"text-center",children:d.jsx("button",{type:"button",onClick:()=>n("/book"),className:"text-sm text-slate-600 hover:text-slate-800",children:"Continue as guest"})})]})})}function bL(){const{db:t}=os(),e=ur(),n=to(),[r,s]=D.useState(null),[i,o]=D.useState([]),[l,u]=D.useState({}),[c,f]=D.useState(!0),[m,g]=D.useState(!1);D.useEffect(()=>{const y=ol(e,_=>{s(_),_||n("/login"),f(!1)});return()=>y()},[e,n]),D.useEffect(()=>{if(!(r!=null&&r.email))return;let y=null;const _=je(t,"customers"),R=Ct(_,Tt("email","==",r.email)),V=Xt(R,j=>{if(j.empty){console.log("No customer found for email:",r.email),o([]),g(!1);return}const I=j.docs[0].id;console.log("Found customer:",I),g(!0);const w=je(t,"appointments"),S=Ct(w,Tt("customerId","==",I));y=Xt(S,T=>{const b=[];T.forEach(P=>{b.push({id:P.id,...P.data()})}),console.log("Fetched appointments:",b.length),o(b)})});return()=>{V(),y&&y()}},[r,t]),D.useEffect(()=>{const y=je(t,"services"),_=Xt(y,R=>{const V={};R.forEach(j=>{V[j.id]={id:j.id,...j.data()}}),u(V)});return()=>_()},[t]);const x=async()=>{try{await bD(e),n("/login")}catch(y){console.error("Sign out error:",y)}},A=async y=>{if(confirm("Are you sure you want to cancel this appointment?"))try{const _=Vs(t,"appointments",y);await yu(_,{status:"cancelled"})}catch(_){console.error("Error cancelling appointment:",_),alert("Failed to cancel appointment. Please try again.")}},C=i.filter(y=>y.status!=="cancelled"&&new Date(y.start)>new Date).sort((y,_)=>new Date(y.start).getTime()-new Date(_.start).getTime()),N=i.filter(y=>new Date(y.start)<new Date).sort((y,_)=>new Date(_.start).getTime()-new Date(y.start).getTime()),E=i.filter(y=>y.status==="cancelled");return c?d.jsx("div",{className:"min-h-screen flex items-center justify-center",children:d.jsx("div",{className:"text-lg text-slate-600",children:"Loading..."})}):d.jsx("div",{className:"min-h-screen bg-gradient-to-br from-terracotta/10 to-cream/30 py-8 px-4 sm:px-6 lg:px-8",children:d.jsxs("div",{className:"max-w-4xl mx-auto",children:[d.jsx("div",{className:"bg-white rounded-2xl shadow-xl p-6 mb-6",children:d.jsxs("div",{className:"flex justify-between items-center",children:[d.jsxs("div",{children:[d.jsx("h1",{className:"text-3xl font-serif text-terracotta",children:"My Appointments"}),d.jsxs("p",{className:"text-slate-600 mt-1",children:["Welcome back, ",(r==null?void 0:r.displayName)||(r==null?void 0:r.email)]})]}),d.jsxs("div",{className:"flex gap-3",children:[d.jsx("button",{onClick:()=>n("/book"),className:"px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors",children:"Book New"}),d.jsx("button",{onClick:x,className:"px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors",children:"Sign Out"})]})]})}),d.jsxs("div",{className:"bg-white rounded-2xl shadow-xl p-6 mb-6",children:[d.jsx("h2",{className:"text-2xl font-serif text-terracotta mb-4",children:"Upcoming"}),m?C.length===0?d.jsx("p",{className:"text-slate-500",children:"No upcoming appointments"}):d.jsx("div",{className:"space-y-4",children:C.map(y=>{var R,V;const _=l[y.serviceId];return d.jsx("div",{className:"border-2 border-terracotta/30 rounded-xl p-5 hover:shadow-lg transition-all bg-gradient-to-br from-white to-cream/30",children:d.jsxs("div",{className:"flex justify-between items-start gap-4",children:[d.jsxs("div",{className:"flex-grow",children:[d.jsxs("div",{className:"flex items-start justify-between mb-2",children:[d.jsx("h3",{className:"font-semibold text-xl text-slate-900",children:(_==null?void 0:_.name)||"Service"}),d.jsx("span",{className:`px-3 py-1 rounded-full text-xs font-medium ${y.status==="confirmed"?"bg-green-100 text-green-800":"bg-yellow-100 text-yellow-800"}`,children:y.status})]}),(_==null?void 0:_.description)&&d.jsx("p",{className:"text-sm text-slate-600 mb-3",children:_.description}),d.jsxs("div",{className:"mb-3",children:[d.jsxs("p",{className:"text-slate-700 font-medium",children:["📅 ",vr(ys(y.start),"EEEE, MMMM d, yyyy")]}),d.jsxs("p",{className:"text-slate-600 text-sm mt-1",children:["🕐 ",vr(ys(y.start),"h:mm a")]})]}),d.jsxs("div",{className:"flex items-center gap-4 text-sm",children:[d.jsxs("span",{className:"inline-flex items-center gap-1.5 text-slate-700",children:[d.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})}),(_==null?void 0:_.duration)||0," min"]}),d.jsxs("span",{className:"inline-flex items-center gap-1.5 font-semibold text-terracotta",children:[d.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),"$",((R=y.bookedPrice)==null?void 0:R.toFixed(2))||((V=_==null?void 0:_.price)==null?void 0:V.toFixed(2))||"0.00"]})]})]}),d.jsx("button",{onClick:()=>A(y.id),className:"px-4 py-2 text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors font-medium flex-shrink-0",children:"Cancel"})]})},y.id)})}):d.jsxs("div",{className:"text-center py-8",children:[d.jsx("div",{className:"text-4xl mb-3",children:"📅"}),d.jsx("p",{className:"text-slate-600 mb-4",children:"You haven't made a booking yet"}),d.jsx("button",{onClick:()=>n("/book"),className:"px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors",children:"Book Your First Appointment"})]})]}),m&&N.length>0&&d.jsxs("div",{className:"bg-white rounded-2xl shadow-xl p-6 mb-6",children:[d.jsx("h2",{className:"text-2xl font-serif text-terracotta mb-4",children:"Past Appointments"}),d.jsx("div",{className:"space-y-4",children:N.map(y=>{var R,V;const _=l[y.serviceId];return d.jsx("div",{className:"border border-slate-300 rounded-xl p-5 bg-slate-50/50",children:d.jsxs("div",{className:"flex-grow",children:[d.jsx("h3",{className:"font-semibold text-lg text-slate-800 mb-2",children:(_==null?void 0:_.name)||"Service"}),(_==null?void 0:_.description)&&d.jsx("p",{className:"text-sm text-slate-600 mb-3",children:_.description}),d.jsxs("div",{className:"mb-3",children:[d.jsxs("p",{className:"text-slate-700 font-medium",children:["📅 ",vr(ys(y.start),"EEEE, MMMM d, yyyy")]}),d.jsxs("p",{className:"text-slate-600 text-sm mt-1",children:["🕐 ",vr(ys(y.start),"h:mm a")]})]}),d.jsxs("div",{className:"flex items-center gap-4 text-sm",children:[d.jsxs("span",{className:"inline-flex items-center gap-1.5 text-slate-600",children:[d.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})}),(_==null?void 0:_.duration)||0," min"]}),d.jsxs("span",{className:"inline-flex items-center gap-1.5 font-semibold text-slate-700",children:[d.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),"$",((R=y.bookedPrice)==null?void 0:R.toFixed(2))||((V=_==null?void 0:_.price)==null?void 0:V.toFixed(2))||"0.00"]})]})]})},y.id)})})]}),m&&E.length>0&&d.jsxs("div",{className:"bg-white rounded-2xl shadow-xl p-6",children:[d.jsx("h2",{className:"text-2xl font-serif text-terracotta mb-4",children:"Cancelled"}),d.jsx("div",{className:"space-y-4",children:E.map(y=>{var R,V;const _=l[y.serviceId];return d.jsx("div",{className:"border border-red-200 rounded-xl p-5 bg-red-50/30 opacity-75",children:d.jsxs("div",{className:"flex-grow",children:[d.jsxs("div",{className:"flex items-start justify-between mb-2",children:[d.jsx("h3",{className:"font-semibold text-lg text-slate-800",children:(_==null?void 0:_.name)||"Service"}),d.jsx("span",{className:"px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800",children:"Cancelled"})]}),(_==null?void 0:_.description)&&d.jsx("p",{className:"text-sm text-slate-600 mb-3",children:_.description}),d.jsxs("div",{className:"mb-3",children:[d.jsxs("p",{className:"text-slate-700 font-medium",children:["📅 ",vr(ys(y.start),"EEEE, MMMM d, yyyy")]}),d.jsxs("p",{className:"text-slate-600 text-sm mt-1",children:["🕐 ",vr(ys(y.start),"h:mm a")]})]}),d.jsxs("div",{className:"flex items-center gap-4 text-sm",children:[d.jsxs("span",{className:"inline-flex items-center gap-1.5 text-slate-600",children:[d.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})}),(_==null?void 0:_.duration)||0," min"]}),d.jsxs("span",{className:"inline-flex items-center gap-1.5 font-semibold text-slate-700",children:[d.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),"$",((R=y.bookedPrice)==null?void 0:R.toFixed(2))||((V=_==null?void 0:_.price)==null?void 0:V.toFixed(2))||"0.00"]})]})]})},y.id)})})]})]})})}function CL(){const{db:t}=os(),[e,n]=D.useState(""),[r,s]=D.useState("idle"),[i,o]=D.useState(""),l=async u=>{if(u.preventDefault(),!!e){s("loading"),o("");try{const c=e.replace(/\D/g,""),f=Ct(je(t,"sms_consents"),Tt("phone","==",c));if(!(await Go(f)).empty){o("This phone number is already subscribed!"),s("error");return}await Ni(je(t,"sms_consents"),{phone:c,consentMethod:"qr_code",timestamp:xn(),status:"active",source:"qr_code"}),s("success"),n("")}catch(c){console.error("SMS subscription error:",c),o("Failed to subscribe. Please try again."),s("error")}}};return d.jsx("div",{className:"min-h-screen bg-gradient-to-br from-terracotta/10 to-cream/30 flex items-center justify-center p-4",children:d.jsxs("div",{className:"max-w-md w-full bg-white rounded-2xl shadow-xl p-8",children:[d.jsxs("div",{className:"text-center mb-6",children:[d.jsx("div",{className:"w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4",children:d.jsx("svg",{className:"w-10 h-10 text-terracotta",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:d.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"})})}),d.jsx("h1",{className:"font-serif text-3xl text-terracotta mb-2",children:"Join Bueno Brows SMS"}),d.jsx("p",{className:"text-slate-600",children:"Get appointment reminders & exclusive offers"})]}),d.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6",children:[d.jsxs("p",{className:"text-sm text-slate-700 mb-3",children:[d.jsx("strong",{children:"Opt-in to SMS messages:"})," By subscribing, you agree to receive automated text messages from Bueno Brows at ",d.jsx("strong",{children:"(650) 613-8455"})," for:"]}),d.jsxs("ul",{className:"text-sm text-slate-700 space-y-1 ml-4",children:[d.jsx("li",{children:"• Appointment confirmations & reminders"}),d.jsx("li",{children:"• Booking assistance via AI-powered assistant"}),d.jsx("li",{children:"• Exclusive offers and promotions"}),d.jsx("li",{children:"• Store updates and information"})]}),d.jsxs("p",{className:"text-xs text-slate-600 mt-3",children:[d.jsx("strong",{children:"Important:"})," Message frequency varies based on your interaction. Responses may be automated by our AI assistant (Gemini API). Message and data rates may apply. Reply ",d.jsx("strong",{children:"STOP"})," to opt out anytime, ",d.jsx("strong",{children:"HELP"})," for assistance. Consent is never required as a condition of purchase."]})]}),d.jsxs("form",{onSubmit:l,className:"space-y-4",children:[d.jsxs("div",{children:[d.jsx("label",{htmlFor:"phone",className:"block text-sm font-medium text-slate-700 mb-2",children:"Phone Number"}),d.jsx("input",{id:"phone",type:"tel",placeholder:"(650) 555-1234",value:e,onChange:u=>n(u.target.value),className:"w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta",required:!0,disabled:r==="loading"||r==="success"})]}),d.jsx("button",{type:"submit",className:"w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",disabled:r==="loading"||r==="success",children:r==="loading"?"Subscribing...":r==="success"?"✓ Subscribed!":"Subscribe to SMS"}),i&&d.jsx("p",{className:"text-red-600 text-sm text-center",children:i}),r==="success"&&d.jsxs("div",{className:"bg-green-50 border border-green-200 rounded-lg p-4 text-center",children:[d.jsx("p",{className:"text-green-800 font-medium mb-2",children:"✓ Successfully Subscribed!"}),d.jsxs("p",{className:"text-sm text-green-700",children:["You'll receive a welcome message shortly. Reply ",d.jsx("strong",{children:"STOP"})," anytime to unsubscribe."]})]})]}),d.jsxs("div",{className:"mt-6 pt-6 border-t border-slate-200 text-center",children:[d.jsx("p",{className:"text-xs text-slate-500",children:"Bueno Brows • 315 9th Ave, San Mateo, CA 94401"}),d.jsx("p",{className:"text-xs text-slate-500 mt-1",children:"(650) 613-8455"})]})]})})}/**
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
 */const c1="firebasestorage.googleapis.com",d1="storageBucket",NL=2*60*1e3,RL=10*60*1e3;/**
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
 */class Pe extends nn{constructor(e,n,r=0){super(bh(e),`Firebase Storage: ${n} (${bh(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,Pe.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return bh(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var Re;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Re||(Re={}));function bh(t){return"storage/"+t}function ng(){const t="An unknown error occurred, please check the error payload for server response.";return new Pe(Re.UNKNOWN,t)}function PL(t){return new Pe(Re.OBJECT_NOT_FOUND,"Object '"+t+"' does not exist.")}function DL(t){return new Pe(Re.QUOTA_EXCEEDED,"Quota for bucket '"+t+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function OL(){const t="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new Pe(Re.UNAUTHENTICATED,t)}function ML(){return new Pe(Re.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function jL(t){return new Pe(Re.UNAUTHORIZED,"User does not have permission to access '"+t+"'.")}function LL(){return new Pe(Re.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function VL(){return new Pe(Re.CANCELED,"User canceled the upload/download.")}function FL(t){return new Pe(Re.INVALID_URL,"Invalid URL '"+t+"'.")}function UL(t){return new Pe(Re.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function BL(){return new Pe(Re.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+d1+"' property when initializing the app?")}function $L(){return new Pe(Re.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function zL(){return new Pe(Re.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function WL(t){return new Pe(Re.UNSUPPORTED_ENVIRONMENT,`${t} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function rp(t){return new Pe(Re.INVALID_ARGUMENT,t)}function h1(){return new Pe(Re.APP_DELETED,"The Firebase app was deleted.")}function HL(t){return new Pe(Re.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function ua(t,e){return new Pe(Re.INVALID_FORMAT,"String does not match format '"+t+"': "+e)}function jo(t){throw new Pe(Re.INTERNAL_ERROR,"Internal error: "+t)}/**
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
 */class Ut{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let r;try{r=Ut.makeFromUrl(e,n)}catch{return new Ut(e,"")}if(r.path==="")return r;throw UL(e)}static makeFromUrl(e,n){let r=null;const s="([A-Za-z0-9.\\-_]+)";function i(R){R.path.charAt(R.path.length-1)==="/"&&(R.path_=R.path_.slice(0,-1))}const o="(/(.*))?$",l=new RegExp("^gs://"+s+o,"i"),u={bucket:1,path:3};function c(R){R.path_=decodeURIComponent(R.path)}const f="v[A-Za-z0-9_]+",m=n.replace(/[.]/g,"\\."),g="(/([^?#]*).*)?$",x=new RegExp(`^https?://${m}/${f}/b/${s}/o${g}`,"i"),A={bucket:1,path:3},C=n===c1?"(?:storage.googleapis.com|storage.cloud.google.com)":n,N="([^?#]*)",E=new RegExp(`^https?://${C}/${s}/${N}`,"i"),_=[{regex:l,indices:u,postModify:i},{regex:x,indices:A,postModify:c},{regex:E,indices:{bucket:1,path:2},postModify:c}];for(let R=0;R<_.length;R++){const V=_[R],j=V.regex.exec(e);if(j){const I=j[V.indices.bucket];let w=j[V.indices.path];w||(w=""),r=new Ut(I,w),V.postModify(r);break}}if(r==null)throw FL(e);return r}}class qL{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
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
 */function GL(t,e,n){let r=1,s=null,i=null,o=!1,l=0;function u(){return l===2}let c=!1;function f(...N){c||(c=!0,e.apply(null,N))}function m(N){s=setTimeout(()=>{s=null,t(x,u())},N)}function g(){i&&clearTimeout(i)}function x(N,...E){if(c){g();return}if(N){g(),f.call(null,N,...E);return}if(u()||o){g(),f.call(null,N,...E);return}r<64&&(r*=2);let _;l===1?(l=2,_=0):_=(r+Math.random())*1e3,m(_)}let A=!1;function C(N){A||(A=!0,g(),!c&&(s!==null?(N||(l=2),clearTimeout(s),m(0)):N||(l=1)))}return m(0),i=setTimeout(()=>{o=!0,C(!0)},n),C}function KL(t){t(!1)}/**
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
 */function QL(t){return t!==void 0}function YL(t){return typeof t=="object"&&!Array.isArray(t)}function rg(t){return typeof t=="string"||t instanceof String}function _0(t){return sg()&&t instanceof Blob}function sg(){return typeof Blob<"u"}function w0(t,e,n,r){if(r<e)throw rp(`Invalid value for '${t}'. Expected ${e} or greater.`);if(r>n)throw rp(`Invalid value for '${t}'. Expected ${n} or less.`)}/**
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
 */function ig(t,e,n){let r=e;return n==null&&(r=`https://${e}`),`${n}://${r}/v0${t}`}function f1(t){const e=encodeURIComponent;let n="?";for(const r in t)if(t.hasOwnProperty(r)){const s=e(r)+"="+e(t[r]);n=n+s+"&"}return n=n.slice(0,-1),n}var Cs;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Cs||(Cs={}));/**
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
 */function XL(t,e){const n=t>=500&&t<600,s=[408,429].indexOf(t)!==-1,i=e.indexOf(t)!==-1;return n||s||i}/**
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
 */class JL{constructor(e,n,r,s,i,o,l,u,c,f,m,g=!0,x=!1){this.url_=e,this.method_=n,this.headers_=r,this.body_=s,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=l,this.errorCallback_=u,this.timeout_=c,this.progressCallback_=f,this.connectionFactory_=m,this.retry=g,this.isUsingEmulator=x,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((A,C)=>{this.resolve_=A,this.reject_=C,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new Xl(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=l=>{const u=l.loaded,c=l.lengthComputable?l.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,c)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const l=i.getErrorCode()===Cs.NO_ERROR,u=i.getStatus();if(!l||XL(u,this.additionalRetryCodes_)&&this.retry){const f=i.getErrorCode()===Cs.ABORT;r(!1,new Xl(!1,null,f));return}const c=this.successCodes_.indexOf(u)!==-1;r(!0,new Xl(c,i))})},n=(r,s)=>{const i=this.resolve_,o=this.reject_,l=s.connection;if(s.wasSuccessCode)try{const u=this.callback_(l,l.getResponse());QL(u)?i(u):i()}catch(u){o(u)}else if(l!==null){const u=ng();u.serverResponse=l.getErrorText(),this.errorCallback_?o(this.errorCallback_(l,u)):o(u)}else if(s.canceled){const u=this.appDelete_?h1():VL();o(u)}else{const u=LL();o(u)}};this.canceled_?n(!1,new Xl(!1,null,!0)):this.backoffId_=GL(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&KL(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Xl{constructor(e,n,r){this.wasSuccessCode=e,this.connection=n,this.canceled=!!r}}function ZL(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function eV(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function tV(t,e){e&&(t["X-Firebase-GMPID"]=e)}function nV(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function rV(t,e,n,r,s,i,o=!0,l=!1){const u=f1(t.urlParams),c=t.url+u,f=Object.assign({},t.headers);return tV(f,e),ZL(f,n),eV(f,i),nV(f,r),new JL(c,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,s,o,l)}/**
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
 */function sV(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function iV(...t){const e=sV();if(e!==void 0){const n=new e;for(let r=0;r<t.length;r++)n.append(t[r]);return n.getBlob()}else{if(sg())return new Blob(t);throw new Pe(Re.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function oV(t,e,n){return t.webkitSlice?t.webkitSlice(e,n):t.mozSlice?t.mozSlice(e,n):t.slice?t.slice(e,n):null}/**
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
 */function aV(t){if(typeof atob>"u")throw WL("base-64");return atob(t)}/**
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
 */const Sn={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class Ch{constructor(e,n){this.data=e,this.contentType=n||null}}function lV(t,e){switch(t){case Sn.RAW:return new Ch(p1(e));case Sn.BASE64:case Sn.BASE64URL:return new Ch(m1(t,e));case Sn.DATA_URL:return new Ch(cV(e),dV(e))}throw ng()}function p1(t){const e=[];for(let n=0;n<t.length;n++){let r=t.charCodeAt(n);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(n<t.length-1&&(t.charCodeAt(n+1)&64512)===56320))e.push(239,191,189);else{const i=r,o=t.charCodeAt(++n);r=65536|(i&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function uV(t){let e;try{e=decodeURIComponent(t)}catch{throw ua(Sn.DATA_URL,"Malformed data URL.")}return p1(e)}function m1(t,e){switch(t){case Sn.BASE64:{const s=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(s||i)throw ua(t,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case Sn.BASE64URL:{const s=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(s||i)throw ua(t,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=aV(e)}catch(s){throw s.message.includes("polyfill")?s:ua(t,"Invalid character found")}const r=new Uint8Array(n.length);for(let s=0;s<n.length;s++)r[s]=n.charCodeAt(s);return r}class g1{constructor(e){this.base64=!1,this.contentType=null;const n=e.match(/^data:([^,]+)?,/);if(n===null)throw ua(Sn.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=n[1]||null;r!=null&&(this.base64=hV(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function cV(t){const e=new g1(t);return e.base64?m1(Sn.BASE64,e.rest):uV(e.rest)}function dV(t){return new g1(t).contentType}function hV(t,e){return t.length>=e.length?t.substring(t.length-e.length)===e:!1}/**
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
 */class Ir{constructor(e,n){let r=0,s="";_0(e)?(this.data_=e,r=e.size,s=e.type):e instanceof ArrayBuffer?(n?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(n?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=s}size(){return this.size_}type(){return this.type_}slice(e,n){if(_0(this.data_)){const r=this.data_,s=oV(r,e,n);return s===null?null:new Ir(s)}else{const r=new Uint8Array(this.data_.buffer,e,n-e);return new Ir(r,!0)}}static getBlob(...e){if(sg()){const n=e.map(r=>r instanceof Ir?r.data_:r);return new Ir(iV.apply(null,n))}else{const n=e.map(o=>rg(o)?lV(Sn.RAW,o).data:o.data_);let r=0;n.forEach(o=>{r+=o.byteLength});const s=new Uint8Array(r);let i=0;return n.forEach(o=>{for(let l=0;l<o.length;l++)s[i++]=o[l]}),new Ir(s,!0)}}uploadData(){return this.data_}}/**
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
 */function y1(t){let e;try{e=JSON.parse(t)}catch{return null}return YL(e)?e:null}/**
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
 */function fV(t){if(t.length===0)return null;const e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function pV(t,e){const n=e.split("/").filter(r=>r.length>0).join("/");return t.length===0?n:t+"/"+n}function v1(t){const e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}/**
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
 */function mV(t,e){return e}class wt{constructor(e,n,r,s){this.server=e,this.local=n||e,this.writable=!!r,this.xform=s||mV}}let Jl=null;function gV(t){return!rg(t)||t.length<2?t:v1(t)}function _1(){if(Jl)return Jl;const t=[];t.push(new wt("bucket")),t.push(new wt("generation")),t.push(new wt("metageneration")),t.push(new wt("name","fullPath",!0));function e(i,o){return gV(o)}const n=new wt("name");n.xform=e,t.push(n);function r(i,o){return o!==void 0?Number(o):o}const s=new wt("size");return s.xform=r,t.push(s),t.push(new wt("timeCreated")),t.push(new wt("updated")),t.push(new wt("md5Hash",null,!0)),t.push(new wt("cacheControl",null,!0)),t.push(new wt("contentDisposition",null,!0)),t.push(new wt("contentEncoding",null,!0)),t.push(new wt("contentLanguage",null,!0)),t.push(new wt("contentType",null,!0)),t.push(new wt("metadata","customMetadata",!0)),Jl=t,Jl}function yV(t,e){function n(){const r=t.bucket,s=t.fullPath,i=new Ut(r,s);return e._makeStorageReference(i)}Object.defineProperty(t,"ref",{get:n})}function vV(t,e,n){const r={};r.type="file";const s=n.length;for(let i=0;i<s;i++){const o=n[i];r[o.local]=o.xform(r,e[o.server])}return yV(r,t),r}function w1(t,e,n){const r=y1(e);return r===null?null:vV(t,r,n)}function _V(t,e,n,r){const s=y1(e);if(s===null||!rg(s.downloadTokens))return null;const i=s.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(c=>{const f=t.bucket,m=t.fullPath,g="/b/"+o(f)+"/o/"+o(m),x=ig(g,n,r),A=f1({alt:"media",token:c});return x+A})[0]}function wV(t,e){const n={},r=e.length;for(let s=0;s<r;s++){const i=e[s];i.writable&&(n[i.server]=t[i.local])}return JSON.stringify(n)}class E1{constructor(e,n,r,s){this.url=e,this.method=n,this.handler=r,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function T1(t){if(!t)throw ng()}function EV(t,e){function n(r,s){const i=w1(t,s,e);return T1(i!==null),i}return n}function TV(t,e){function n(r,s){const i=w1(t,s,e);return T1(i!==null),_V(i,s,t.host,t._protocol)}return n}function x1(t){function e(n,r){let s;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?s=ML():s=OL():n.getStatus()===402?s=DL(t.bucket):n.getStatus()===403?s=jL(t.path):s=r,s.status=n.getStatus(),s.serverResponse=r.serverResponse,s}return e}function xV(t){const e=x1(t);function n(r,s){let i=e(r,s);return r.getStatus()===404&&(i=PL(t.path)),i.serverResponse=s.serverResponse,i}return n}function IV(t,e,n){const r=e.fullServerUrl(),s=ig(r,t.host,t._protocol),i="GET",o=t.maxOperationRetryTime,l=new E1(s,i,TV(t,n),o);return l.errorHandler=xV(e),l}function SV(t,e){return t&&t.contentType||e&&e.type()||"application/octet-stream"}function AV(t,e,n){const r=Object.assign({},n);return r.fullPath=t.path,r.size=e.size(),r.contentType||(r.contentType=SV(null,e)),r}function kV(t,e,n,r,s){const i=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function l(){let _="";for(let R=0;R<2;R++)_=_+Math.random().toString().slice(2);return _}const u=l();o["Content-Type"]="multipart/related; boundary="+u;const c=AV(e,r,s),f=wV(c,n),m="--"+u+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+u+`\r
Content-Type: `+c.contentType+`\r
\r
`,g=`\r
--`+u+"--",x=Ir.getBlob(m,r,g);if(x===null)throw $L();const A={name:c.fullPath},C=ig(i,t.host,t._protocol),N="POST",E=t.maxUploadRetryTime,y=new E1(C,N,EV(t,n),E);return y.urlParams=A,y.headers=o,y.body=x.uploadData(),y.errorHandler=x1(e),y}class bV{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Cs.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Cs.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Cs.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,n,r,s,i){if(this.sent_)throw jo("cannot .send() more than once");if(or(e)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,e,!0),i!==void 0)for(const o in i)i.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,i[o].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw jo("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw jo("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw jo("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw jo("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class CV extends bV{initXhr(){this.xhr_.responseType="text"}}function I1(){return new CV}/**
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
 */class Ws{constructor(e,n){this._service=e,n instanceof Ut?this._location=n:this._location=Ut.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new Ws(e,n)}get root(){const e=new Ut(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return v1(this._location.path)}get storage(){return this._service}get parent(){const e=fV(this._location.path);if(e===null)return null;const n=new Ut(this._location.bucket,e);return new Ws(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw HL(e)}}function NV(t,e,n){t._throwIfRoot("uploadBytes");const r=kV(t.storage,t._location,_1(),new Ir(e,!0),n);return t.storage.makeRequestWithTokens(r,I1).then(s=>({metadata:s,ref:t}))}function RV(t){t._throwIfRoot("getDownloadURL");const e=IV(t.storage,t._location,_1());return t.storage.makeRequestWithTokens(e,I1).then(n=>{if(n===null)throw zL();return n})}function PV(t,e){const n=pV(t._location.path,e),r=new Ut(t._location.bucket,n);return new Ws(t.storage,r)}/**
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
 */function DV(t){return/^[A-Za-z]+:\/\//.test(t)}function OV(t,e){return new Ws(t,e)}function S1(t,e){if(t instanceof og){const n=t;if(n._bucket==null)throw BL();const r=new Ws(n,n._bucket);return e!=null?S1(r,e):r}else return e!==void 0?PV(t,e):t}function MV(t,e){if(e&&DV(e)){if(t instanceof og)return OV(t,e);throw rp("To use ref(service, url), the first argument must be a Storage instance.")}else return S1(t,e)}function E0(t,e){const n=e==null?void 0:e[d1];return n==null?null:Ut.makeFromBucketSpec(n,t)}function jV(t,e,n,r={}){t.host=`${e}:${n}`;const s=or(e);s&&(Vc(`https://${t.host}/b`),Fc("Storage",!0)),t._isUsingEmulator=!0,t._protocol=s?"https":"http";const{mockUserToken:i}=r;i&&(t._overrideAuthToken=typeof i=="string"?i:nT(i,t.app.options.projectId))}class og{constructor(e,n,r,s,i,o=!1){this.app=e,this._authProvider=n,this._appCheckProvider=r,this._url=s,this._firebaseVersion=i,this._isUsingEmulator=o,this._bucket=null,this._host=c1,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=NL,this._maxUploadRetryTime=RL,this._requests=new Set,s!=null?this._bucket=Ut.makeFromBucketSpec(s,this._host):this._bucket=E0(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Ut.makeFromBucketSpec(this._url,e):this._bucket=E0(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){w0("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){w0("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(ht(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new Ws(this,e)}_makeRequest(e,n,r,s,i=!0){if(this._deleted)return new qL(h1());{const o=rV(e,this._appId,r,s,n,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,n){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,r,s).getPromise()}}const T0="@firebase/storage",x0="0.13.14";/**
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
 */const A1="storage";function LV(t,e,n){return t=ce(t),NV(t,e,n)}function VV(t){return t=ce(t),RV(t)}function FV(t,e){return t=ce(t),MV(t,e)}function UV(t=Ya(),e){t=ce(t);const r=ts(t,A1).getImmediate({identifier:e}),s=Jp("storage");return s&&BV(r,...s),r}function BV(t,e,n,r={}){jV(t,e,n,r)}function $V(t,{instanceIdentifier:e}){const n=t.getProvider("app").getImmediate(),r=t.getProvider("auth-internal"),s=t.getProvider("app-check-internal");return new og(n,r,s,e,Qs)}function zV(){en(new zt(A1,$V,"PUBLIC").setMultipleInstances(!0)),ft(T0,x0,""),ft(T0,x0,"esm2017")}zV();function WV(){const[t,e]=D.useState("skin"),[n,r]=D.useState(null),[s,i]=D.useState(""),[o,l]=D.useState(!1),[u,c]=D.useState(null),[f,m]=D.useState(""),[g,x]=D.useState([]),[A,C]=D.useState(!1),N=D.useRef(null),E=ur(),y=to(),[_,R]=D.useState(E.currentUser),[V,j]=D.useState(!0);D.useEffect(()=>{const T=ol(E,b=>{R(b),j(!1)});return()=>T()},[E]),D.useEffect(()=>{if(!_)return;const T=Yf(),b=Ct(je(T,"skinAnalyses"),Tt("customerId","==",_.uid),Hn("createdAt","desc")),P=Xt(b,k=>{const J=k.docs.map(yt=>({...yt.data(),id:yt.id}));x(J)});return()=>P()},[_]);const I=T=>{var k;const b=(k=T.target.files)==null?void 0:k[0];if(!b)return;if(!b.type.startsWith("image/")){m("Please select a valid image file");return}if(b.size>5*1024*1024){m("Image size must be less than 5MB");return}r(b),m("");const P=new FileReader;P.onloadend=()=>{i(P.result)},P.readAsDataURL(b)},w=async()=>{if(!n){m("Please select an image first");return}if(!_){m("Please log in to use skin analysis");return}l(!0),m("");try{const T=UV(),b=Yf(),P=ud(),k=Date.now(),J=`skin-analysis/${_.uid}/${k}_${n.name}`,yt=FV(T,J);await LV(yt,n);const rn=await VV(yt),At={type:t,imageUrl:rn,customerId:_.uid,customerEmail:_.email||"",customerName:_.displayName||"Customer",status:"pending",createdAt:xn()},z=await Ni(je(b,"skinAnalyses"),At),pe=(await ao(P,t==="skin"?"analyzeSkinPhoto":"analyzeSkinCareProducts")({analysisId:z.id,imageUrl:rn,analysisType:t})).data.analysis;c({...At,id:z.id,analysis:pe,status:"completed"})}catch(T){console.error("Analysis error:",T),m(T.message||"Failed to analyze image. Please try again.")}finally{l(!1)}},S=()=>{r(null),i(""),c(null),m(""),N.current&&(N.current.value="")};return V?d.jsx("div",{className:"flex items-center justify-center min-h-screen",children:d.jsx("div",{className:"text-center",children:d.jsx("div",{className:"text-lg text-slate-600",children:"Loading..."})})}):_?d.jsxs("div",{className:"max-w-4xl mx-auto py-8",children:[d.jsxs("div",{className:"text-center mb-8",children:[d.jsxs("h1",{className:"text-4xl font-bold mb-4",children:[d.jsx("span",{className:"font-brandBueno text-brand-bueno",children:"AI"}),d.jsx("span",{className:"ml-2 font-brandBrows text-brand-brows",children:"SKIN ANALYSIS"})]}),d.jsx("p",{className:"text-slate-600 text-lg",children:"Get personalized skin care recommendations powered by AI"}),g.length>0&&d.jsxs("button",{onClick:()=>C(!A),className:"mt-4 text-terracotta hover:underline text-sm",children:[A?"Hide":"View"," Past Analyses (",g.length,")"]})]}),A&&g.length>0&&d.jsxs("div",{className:"mb-8 bg-white rounded-lg shadow-lg p-6",children:[d.jsx("h2",{className:"text-xl font-bold mb-4",children:"Your Past Analyses"}),d.jsx("div",{className:"space-y-3",children:g.map(T=>d.jsx("div",{onClick:()=>c(T),className:"border rounded-lg p-4 cursor-pointer hover:border-terracotta transition-colors",children:d.jsxs("div",{className:"flex items-center justify-between",children:[d.jsxs("div",{className:"flex items-center gap-3",children:[d.jsx("img",{src:T.imageUrl,alt:"Analysis",className:"w-16 h-16 object-cover rounded"}),d.jsxs("div",{children:[d.jsx("div",{className:"font-semibold",children:T.type==="skin"?"📸 Skin Analysis":"🧴 Product Analysis"}),d.jsx("div",{className:"text-sm text-slate-600",children:T.createdAt&&new Date(T.createdAt.toDate()).toLocaleDateString()})]})]}),d.jsx("span",{className:`px-3 py-1 rounded-full text-xs font-semibold ${T.status==="completed"?"bg-green-100 text-green-800":T.status==="pending"?"bg-yellow-100 text-yellow-800":"bg-red-100 text-red-800"}`,children:T.status})]})},T.id))})]}),u?d.jsxs("div",{className:"space-y-6",children:[d.jsxs("div",{className:"bg-white rounded-lg shadow-lg p-8",children:[d.jsxs("div",{className:"flex items-center justify-between mb-6",children:[d.jsx("h2",{className:"text-2xl font-bold text-terracotta",children:"Your Analysis Results"}),d.jsx("button",{onClick:S,className:"px-4 py-2 border border-terracotta text-terracotta rounded-lg hover:bg-terracotta hover:text-white transition-colors",children:"New Analysis"})]}),d.jsx("div",{className:"mb-6",children:d.jsx("img",{src:u.imageUrl,alt:"Analyzed",className:"max-h-48 mx-auto rounded-lg"})}),d.jsxs("div",{className:"mb-6 p-4 bg-terracotta/10 rounded-lg",children:[d.jsx("h3",{className:"font-semibold text-lg mb-2",children:"Summary"}),d.jsx("p",{className:"text-slate-700",children:u.analysis.summary})]}),u.type==="skin"&&u.analysis.skinType&&d.jsxs("div",{className:"mb-6",children:[d.jsx("h3",{className:"font-semibold text-lg mb-2",children:"Your Skin Type"}),d.jsx("div",{className:"inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold",children:u.analysis.skinType})]}),u.type==="skin"&&u.analysis.skinTone&&d.jsxs("div",{className:"mb-6",children:[d.jsx("h3",{className:"font-semibold text-lg mb-3",children:"Your Skin Tone"}),d.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[d.jsxs("div",{className:"border rounded-lg p-4",children:[d.jsx("div",{className:"text-sm text-slate-600 mb-1",children:"Category"}),d.jsx("div",{className:"font-semibold text-lg",children:u.analysis.skinTone.category})]}),d.jsxs("div",{className:"border rounded-lg p-4",children:[d.jsx("div",{className:"text-sm text-slate-600 mb-1",children:"Undertone"}),d.jsx("div",{className:"font-semibold text-lg",children:u.analysis.skinTone.undertone})]}),d.jsxs("div",{className:"border rounded-lg p-4",children:[d.jsx("div",{className:"text-sm text-slate-600 mb-1",children:"Fitzpatrick Scale"}),d.jsxs("div",{className:"font-semibold text-lg",children:["Type ",u.analysis.skinTone.fitzpatrickScale]})]}),u.analysis.skinTone.hexColor&&d.jsxs("div",{className:"border rounded-lg p-4",children:[d.jsx("div",{className:"text-sm text-slate-600 mb-1",children:"Approximate Color"}),d.jsxs("div",{className:"flex items-center gap-2",children:[d.jsx("div",{className:"w-8 h-8 rounded border border-gray-300",style:{backgroundColor:u.analysis.skinTone.hexColor}}),d.jsx("div",{className:"font-mono text-sm",children:u.analysis.skinTone.hexColor})]})]})]})]}),u.type==="skin"&&u.analysis.foundationMatch&&d.jsxs("div",{className:"mb-6",children:[d.jsx("h3",{className:"font-semibold text-lg mb-3",children:"Foundation Match"}),d.jsxs("div",{className:"border rounded-lg p-4 bg-pink-50",children:[d.jsxs("div",{className:"mb-3",children:[d.jsx("div",{className:"text-sm text-slate-600 mb-1",children:"Shade Range"}),d.jsx("div",{className:"font-semibold",children:u.analysis.foundationMatch.shadeRange})]}),d.jsxs("div",{className:"mb-3",children:[d.jsx("div",{className:"text-sm text-slate-600 mb-1",children:"Undertone Recommendation"}),d.jsx("div",{className:"font-semibold",children:u.analysis.foundationMatch.undertoneRecommendation})]}),u.analysis.foundationMatch.popularBrands&&u.analysis.foundationMatch.popularBrands.length>0&&d.jsxs("div",{children:[d.jsx("div",{className:"text-sm text-slate-600 mb-2",children:"Recommended Brands & Shades"}),d.jsx("div",{className:"space-y-2",children:u.analysis.foundationMatch.popularBrands.map((T,b)=>d.jsxs("div",{className:"bg-white rounded p-3",children:[d.jsx("div",{className:"font-semibold text-sm mb-1",children:T.brand}),d.jsx("div",{className:"text-xs text-slate-600",children:T.shades.join(", ")})]},b))})]})]})]}),u.type==="skin"&&u.analysis.facialFeatures&&d.jsxs("div",{className:"mb-6",children:[d.jsx("h3",{className:"font-semibold text-lg mb-3",children:"Facial Features"}),d.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[u.analysis.facialFeatures.faceShape&&d.jsxs("div",{className:"border rounded-lg p-3",children:[d.jsx("div",{className:"text-sm text-slate-600",children:"Face Shape"}),d.jsx("div",{className:"font-semibold",children:u.analysis.facialFeatures.faceShape})]}),u.analysis.facialFeatures.browShape&&d.jsxs("div",{className:"border rounded-lg p-3",children:[d.jsx("div",{className:"text-sm text-slate-600",children:"Brow Shape"}),d.jsx("div",{className:"font-semibold",children:u.analysis.facialFeatures.browShape})]}),u.analysis.facialFeatures.eyeShape&&d.jsxs("div",{className:"border rounded-lg p-3",children:[d.jsx("div",{className:"text-sm text-slate-600",children:"Eye Shape"}),d.jsx("div",{className:"font-semibold",children:u.analysis.facialFeatures.eyeShape})]}),u.analysis.facialFeatures.lipShape&&d.jsxs("div",{className:"border rounded-lg p-3",children:[d.jsx("div",{className:"text-sm text-slate-600",children:"Lip Shape"}),d.jsx("div",{className:"font-semibold",children:u.analysis.facialFeatures.lipShape})]})]})]}),u.analysis.detailedReport&&d.jsxs("div",{className:"mb-6",children:[d.jsx("h3",{className:"font-semibold text-lg mb-3",children:"Detailed Report"}),d.jsx("div",{className:"border rounded-lg p-4 bg-slate-50",children:d.jsx("p",{className:"text-slate-700 whitespace-pre-line",children:u.analysis.detailedReport})})]}),u.analysis.concerns&&u.analysis.concerns.length>0&&d.jsxs("div",{className:"mb-6",children:[d.jsx("h3",{className:"font-semibold text-lg mb-3",children:"Identified Concerns"}),d.jsx("div",{className:"flex flex-wrap gap-2",children:u.analysis.concerns.map((T,b)=>d.jsx("span",{className:"px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm",children:T},b))})]}),u.analysis.recommendations&&u.analysis.recommendations.length>0&&d.jsxs("div",{className:"mb-6",children:[d.jsx("h3",{className:"font-semibold text-lg mb-3",children:"Recommendations"}),d.jsx("ul",{className:"space-y-2",children:u.analysis.recommendations.map((T,b)=>d.jsxs("li",{className:"flex items-start gap-2",children:[d.jsx("span",{className:"text-terracotta mt-1",children:"✓"}),d.jsx("span",{className:"text-slate-700",children:T})]},b))})]}),u.type==="products"&&u.analysis.productAnalysis&&d.jsxs("div",{className:"mb-6",children:[d.jsx("h3",{className:"font-semibold text-lg mb-3",children:"Product Routine"}),u.analysis.productAnalysis.products&&d.jsx("div",{className:"space-y-3 mb-4",children:u.analysis.productAnalysis.products.sort((T,b)=>T.order-b.order).map((T,b)=>d.jsx("div",{className:"border rounded-lg p-4",children:d.jsxs("div",{className:"flex items-start gap-3",children:[d.jsx("div",{className:"flex-shrink-0 w-8 h-8 bg-terracotta text-white rounded-full flex items-center justify-center font-bold",children:T.order}),d.jsxs("div",{className:"flex-1",children:[d.jsx("h4",{className:"font-semibold mb-1",children:T.name}),d.jsx("p",{className:"text-sm text-slate-600 mb-2",children:T.usage}),d.jsx("div",{className:"inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs",children:T.suitability})]})]})},b))}),u.analysis.productAnalysis.routine&&d.jsxs("div",{className:"p-4 bg-blue-50 rounded-lg",children:[d.jsx("h4",{className:"font-semibold mb-2",children:"Complete Routine"}),d.jsx("p",{className:"text-sm text-slate-700 whitespace-pre-line",children:u.analysis.productAnalysis.routine})]})]}),u.analysis.recommendedServices&&u.analysis.recommendedServices.length>0&&d.jsxs("div",{className:"mb-6",children:[d.jsx("h3",{className:"font-semibold text-lg mb-3",children:"Recommended Services"}),d.jsx("div",{className:"space-y-3",children:u.analysis.recommendedServices.map((T,b)=>d.jsxs("div",{className:"border border-terracotta rounded-lg p-4",children:[d.jsxs("div",{className:"flex items-start justify-between mb-2",children:[d.jsx("h4",{className:"font-semibold text-terracotta",children:T.serviceName}),d.jsx("span",{className:"text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded",children:T.frequency})]}),d.jsx("p",{className:"text-sm text-slate-700",children:T.reason})]},b))}),d.jsx("div",{className:"mt-6 text-center",children:d.jsx("a",{href:"/book",className:"inline-block px-8 py-3 bg-terracotta text-white rounded-lg font-semibold hover:bg-terracotta/90 transition-colors",children:"Book a Service"})})]})]}),d.jsxs("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800",children:[d.jsx("strong",{children:"Disclaimer:"})," This analysis is provided by AI and should not replace professional medical advice. For specific skin concerns, please consult with a dermatologist."]})]}):d.jsxs("div",{className:"bg-white rounded-lg shadow-lg p-8",children:[d.jsxs("div",{className:"mb-8",children:[d.jsx("h2",{className:"text-xl font-semibold mb-4",children:"What would you like to analyze?"}),d.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[d.jsxs("button",{onClick:()=>e("skin"),className:`p-6 rounded-lg border-2 transition-all ${t==="skin"?"border-terracotta bg-terracotta/10":"border-gray-200 hover:border-terracotta/50"}`,children:[d.jsx("div",{className:"text-4xl mb-2",children:"📸"}),d.jsx("h3",{className:"font-semibold text-lg mb-2",children:"Skin Analysis"}),d.jsx("p",{className:"text-sm text-slate-600",children:"Upload a photo of your face for personalized skin type analysis and service recommendations"})]}),d.jsxs("button",{onClick:()=>e("products"),className:`p-6 rounded-lg border-2 transition-all ${t==="products"?"border-terracotta bg-terracotta/10":"border-gray-200 hover:border-terracotta/50"}`,children:[d.jsx("div",{className:"text-4xl mb-2",children:"🧴"}),d.jsx("h3",{className:"font-semibold text-lg mb-2",children:"Product Analysis"}),d.jsx("p",{className:"text-sm text-slate-600",children:"Upload photos of your skincare products for usage order and compatibility analysis"})]})]})]}),d.jsxs("div",{className:"mb-6",children:[d.jsx("h2",{className:"text-xl font-semibold mb-4",children:t==="skin"?"Upload Your Photo":"Upload Product Photos"}),d.jsx("div",{className:"border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-terracotta transition-colors",children:s?d.jsxs("div",{className:"space-y-4",children:[d.jsx("img",{src:s,alt:"Preview",className:"max-h-64 mx-auto rounded-lg"}),d.jsx("button",{onClick:()=>{r(null),i(""),N.current&&(N.current.value="")},className:"text-sm text-terracotta hover:underline",children:"Change Image"})]}):d.jsxs("div",{children:[d.jsx("div",{className:"text-6xl mb-4",children:"📷"}),d.jsx("p",{className:"text-slate-600 mb-4",children:t==="skin"?"Take a clear photo of your face in good lighting":"Take photos of your skincare product labels"}),d.jsx("input",{ref:N,type:"file",accept:"image/*",onChange:I,className:"hidden",id:"image-upload"}),d.jsx("label",{htmlFor:"image-upload",className:"inline-block px-6 py-3 bg-terracotta text-white rounded-lg cursor-pointer hover:bg-terracotta/90 transition-colors",children:"Choose Image"})]})}),t==="skin"&&d.jsxs("div",{className:"mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg",children:[d.jsx("p",{className:"text-sm text-yellow-800 font-semibold mb-2",children:"💡 Tips for best results:"}),d.jsxs("ul",{className:"text-sm text-yellow-700 space-y-1 list-disc list-inside",children:[d.jsx("li",{children:"Use natural lighting (near a window is ideal)"}),d.jsx("li",{children:"Make sure your face is clearly visible and in focus"}),d.jsx("li",{children:"Remove makeup for most accurate analysis"}),d.jsx("li",{children:"Face the camera directly"})]})]})]}),f&&d.jsx("div",{className:"mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800",children:f}),d.jsx("button",{onClick:w,disabled:!n||o,className:"w-full py-4 bg-terracotta text-white rounded-lg font-semibold text-lg hover:bg-terracotta/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors",children:o?d.jsxs("span",{className:"flex items-center justify-center gap-2",children:[d.jsxs("svg",{className:"animate-spin h-5 w-5",viewBox:"0 0 24 24",children:[d.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4",fill:"none"}),d.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),"Analyzing..."]}):`Analyze ${t==="skin"?"My Skin":"My Products"}`})]})]}):d.jsx("div",{className:"max-w-2xl mx-auto py-16 px-4",children:d.jsxs("div",{className:"bg-white rounded-lg shadow-lg p-8 text-center",children:[d.jsx("div",{className:"text-6xl mb-4",children:"🔒"}),d.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Login Required"}),d.jsx("p",{className:"text-slate-600 mb-6",children:"You need to be logged in to access AI Skin Analysis. This feature saves your results to your profile for future reference."}),d.jsxs("div",{className:"space-y-3",children:[d.jsx("button",{onClick:()=>y("/login"),className:"w-full px-6 py-3 bg-terracotta text-white rounded-lg font-semibold hover:bg-terracotta/90 transition-colors",children:"Login to Continue"}),d.jsx("button",{onClick:()=>y("/"),className:"w-full px-6 py-3 border border-gray-300 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors",children:"Back to Home"})]})]})})}function HV(){return d.jsxs("div",{className:"min-h-screen bg-cream text-slate-800",children:[d.jsx(DM,{}),d.jsx("main",{className:"max-w-6xl mx-auto p-6",children:d.jsxs(yb,{children:[d.jsx(wn,{path:"/",element:d.jsx(VM,{})}),d.jsx(wn,{path:"/services",element:d.jsx(FM,{})}),d.jsx(wn,{path:"/book",element:d.jsx(IL,{})}),d.jsx(wn,{path:"/reviews",element:d.jsx(SL,{})}),d.jsx(wn,{path:"/skin-analysis",element:d.jsx(WV,{})}),d.jsx(wn,{path:"/confirmation",element:d.jsx(AL,{})}),d.jsx(wn,{path:"/login",element:d.jsx(kL,{})}),d.jsx(wn,{path:"/dashboard",element:d.jsx(bL,{})}),d.jsx(wn,{path:"/sms-optin",element:d.jsx(CL,{})})]})}),d.jsx("footer",{className:"border-t bg-white/60 mt-12",children:d.jsxs("div",{className:"max-w-6xl mx-auto p-6 text-xs text-slate-600",children:["© ",new Date().getFullYear(),d.jsx("span",{className:"ml-2 font-brandBueno text-brand-bueno",children:"BUENO"}),d.jsx("span",{className:"ml-1 font-brandBrows text-brand-brows",children:"BROWS"})]})})]})}Nh.createRoot(document.getElementById("root")).render(d.jsx(O0.StrictMode,{children:d.jsx(PM,{children:d.jsx(Sb,{children:d.jsx(HV,{})})})}));
