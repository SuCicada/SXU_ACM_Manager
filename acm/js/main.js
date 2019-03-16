function show_status(obj){
	obj.parentNode.querySelector('span').innerText = 
	'门云：' + (obj.classList.contains('mui-active') == 1 ? '吾启也' : '吾已休');
}

//  ============== LISTENING ============
var isManual = 1;
mui('.mui-content .mui-switch').each(function() { //循环所有toggle
	//toggle.classList.contains('mui-active') 可识别该toggle的开关状态
	show_status(this);
	/**
	 * toggle 事件监听
	 */
	this.addEventListener('toggle', function(event) {
		//event.detail.isActive 可直接获取当前状态
		var active = event.detail.isActive;
		// auto_switch(active);
		show_status(this);
// 				this.parentNode.querySelector('span').innerText = 
// 					'门曰：' + (active ? 'ON' : 'CLOSE');
		res = active;

		// http://www.bcty365.com/content-146-2411-1.html
		if (isManual) {
			input_password(event);
					
			// isManual = false;
		} else{
			isManual = true;					
		}
		
	});

	function input_password(e){
		// alert(e);
		// e = event;
		// e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var active = document.getElementById("mySwitch").classList.contains("mui-active");
		if(active){
			right = "开门";
			msg = "开门困难,\n握住把手向上提门"
		}else{
			right = "关门";
			msg = "关灯，拿好东西和钥匙,\n握住把手向上提门";
		}
		var btnArray = ['取消', right];
		mui.prompt(msg, 'password', '输入密码', btnArray, function(e) {
			if (e.index == 1) {
				password = e.value;
				// https://www.cnblogs.com/dealblog/p/6885437.html
				var switcher = document.getElementById("mySwitch");
				var classVal = switcher.getAttribute("class").concat(" mui-disabled");
				switcher.setAttribute("class",classVal);
				open_or_close(password, active);
				
			} else {
				// info.innerText = '你点了取消按钮';
				isManual = false;
				mui("#mySwitch").switch().toggle();

			}
		},'div');
		 
		// http://ask.dcloud.net.cn/question/15818
		document.querySelector('.mui-popup-input input').type='password';
	}
});

	
// =================== XHR =================================
var door_status = 0;

function check(){
	// alert("dd");
	
	if (window.XMLHttpRequest){
		// IE7+, Firefox, Chrome, Opera, Safari 浏览器执行的代码
		xmlhttp=new XMLHttpRequest();
	}else{    
		//IE6, IE5 浏览器执行的代码
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open("GET","http://cicada.iask.in/ACM/acm.php?q="+"status",true);
	xmlhttp.onreadystatechange=function(){
		
		if (xmlhttp.readyState==4){					
			if(xmlhttp.status==200){
				res = xmlhttp.responseText;
				door = JSON.parse(res)["door"];
				name = JSON.parse(res)["name"];
				auto_switch(door,name);
				
				var swi = document.getElementById("div_switch");
				if(swi.style.display == "none"){
					swi.style.display = "";
				}
				var isActive = document.getElementById("mySwitch").classList.contains("mui-active");
				if(isActive ^ door_status){
					isManual = false;
					mui("#mySwitch").switch().toggle();
				}
				
				mui.hideLoading(function(){});
				
				// mui.toast('查看成功',{ duration:500, type:'div' });
				
				mui.hideLoading(function(){});
			}else{
				mui.alert('服务器错误', '', function() {
				});
				mui.hideLoading(function(){});
			}
		}
	}
	mui.showLoading("芝麻你开门吗...","div");
	xmlhttp.send();	
}
	
function auto_switch(res,name){
	if(res == true){
		door_status = 1;
		res = "门已开，欢迎，又是美好的一天";
	}else if(res == false){
		door_status = 0;
		name = (name==""||name==null)?"管理员":name;
		res = "门已关，开门联系 <span style=\"color: #CF2D28;' \" >" +name+"</span> ";
	} 
	document.getElementById("showbar").innerHTML=res;
}
	
function yourname(){
	// e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
	var btnArray = ['是我'];
	var name;
	mui.prompt('', '你的名字是？', '是谁拿钥匙',btnArray, function(e) {
		if (e.index == 0) {
			// info.innerText = '谢谢你的评语：' + e.value;
			name = e.value;
			 if(e.value == ''){  
				mui.toast("你的名字...呢？");
				return false;  
			}  
			mui.ajax('http://cicada.iask.in/ACM/acm.php',{
				data:{
					q:'key_holder',
					name:name
				},
				dataType:'json',//服务器返回json格式数据
				type:'get',//HTTP请求类型
				timeout:15000,//超时时间设置为10秒；
				//headers:{'Content-Type':'application/json'},	              
				beforeSend: function() {
					msg = "钥匙...";
					mui.showLoading(msg,"div"); //加载文字和类型，plus环境中类型为div时强制以div方式显示  		
				},
				complete: function() {
					mui.hideLoading(function(){
						
					});//隐藏后的回调函数  
				},
				success:function(data){
					//服务器返回响应，根据响应结果，分析是否登录成功；
					mui.toast("key持有:"+name);
					check();
				},
				error:function(xhr,type,errorThrown){
					//异常处理；
					console.log(type);
					check();
				}
			});
		}
	},'div');
}
	
function open_or_close(password, active){
	var mask = document.createElement("div");//遮罩层

	mui.ajax('http://cicada.iask.in/ACM/acm.php',{
		data:{
			q:'change',
			password: password,
			new_status:active
		},
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:15000,//超时时间设置为秒；
		headers:{'Content-Type':'application/x-www-form-urlencoded'},
		beforeSend: function() {
			msg = active?"开门中...":"关门中...";
			mui.showLoading(msg,"div"); //加载文字和类型，plus环境中类型为div时强制以div方式显示  		
		},
		complete: function() {
			mui.hideLoading(function(){
				
			});//隐藏后的回调函数  
		},
		success:function(data){
			//服务器返回响应，根据响应结果，分析是否登录成功；
			access = data;
			if(access["access"]=="true"){
				auto_switch(active);
				mui.toast(right+"成功",{ duration:'long', type:'div' });
				if(active==false){
					yourname();
				}else{
					check();
				}
				// isManual = false;
			}else{
							
				mui.alert('密码错误', '', function() {
				});
				isManual = false;
				mui("#mySwitch").switch().toggle();
		
			}
			//将开关解锁,
			var switcher = document.getElementById("mySwitch");
			var classVal = switcher.getAttribute("class").replace("mui-disabled","");
			switcher.setAttribute("class",classVal);
			// return JSON.stringify(data);
		},
		error:function(xhr,type,errorThrown){
			//异常处理；
			console.log(type);
			
			mui.alert('服务器错误', '', function() {});
			isManual = false;
			mui("#mySwitch").switch().toggle();
			
			var switcher = document.getElementById("mySwitch");
			var classVal = switcher.getAttribute("class").replace("mui-disabled","");
			switcher.setAttribute("class",classVal);
			
			check();
		}
	});
}