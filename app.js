var app = (function(){
	var api_version,api_root,api,schema_url,root_schema;
	var editor;
	var active;
	var settings = {
		// disable_collapse:true,
		// disable_edit_json:true,
		disable_properties:true,
		iconlib: "fontawesome4",
		ajax:true,
		schema: {
			"type":"string",
			"title":"project",
		}
	};
	var projects = {};
	var project;
	function getProjects(){
		$.ajax({
			url:this.api+'projects',
			context:this,
			dataType:'json'
		}).done(function(m){
			if(!m)return false;
			var projob = {};
			$.each(m.results,function(i,r){
				console.log(r.project.file_name);
				
				if(r && r.project.hasOwnProperty('file_name')){
					console.log(r);
					projob[r.project.file_name] = r;
				}
			});
			this.projects = projob;
			console.log(projob);
			if(this.projects){
				var $projectList = $('#projectList');
				$projectList.empty();
				$.each(this.projects,function(i,p){
					// console.log(p);
					// console.log(p.project.name);
					$projectList.append('<option value="'+i+'">'+p.project.name+'</option>');
				});
			}
		});
	}
	function getProject(filename){
		$.ajax({
			url:this.api+'project/'+filename,
			dataType:'json',
			context:this
		}).done(function(m){
			if(!m)return false;
			this.project = m.results[0];
			this.reload();
		});
	}
	function getBrowser(baseDir,targetId,files){
		$('body').append('<div class="mask top dark clearable"></div>');
		$('body').append('<div class="modal message clearable">loading '+baseDir+' . . . </div>');
		$.ajax({
			url:'browse.php?dir='+baseDir+'&files='+files
		}).done(function(m){
			$(targetId).html(m);
			clear();
		});	
	}
	var save = function(){
		var project = this.editor.getValue();
		$('body').append('<div class="mask top dark clearable"></div>');
		$('body').append('<div class="modal message clearable">saving project "'+project.project.name+'" . . . </div>');
		var toJson = JSON.stringify(project);
		// console.log(toJson);
		$.ajax({
			context:this,
			url:this.api+'project/'+project.project.file_name,
			data:{
				serialized:toJson
			},
			method:'post'
		}).done(function(m){
			console.log(m);
			this.clear();
			this.getProjects();
			this.reload();
		});
	};
	var clear = function(){
		$('.clearable').remove();
	}
	var reload = function(){
		if(this.editor){
			this.editor.destroy();
		}
		if(this.project){
			this.settings.startval = this.project;
		}
		this.editor = new JSONEditor(document.getElementById('projectEditor'),this.settings);
	}
	function setHandles(){
		// handles
		$('#submitNewProject').on('click',function(e){
			e.preventDefault();
			var ob = $('#newProject')
				.serializeArray()
				.reduce(function(obj, v) {
					obj[v.name] = v.value;
					return obj;
				}, { });
			console.log(ob);
		});
		$('#projectList').on('change',function(){
			var val = $(this).val();
			app.getProject(val);
		});
		$('body').on('click','.close',function(){
			$('#darkMask').fadeOut(100);
			$(this).closest('.modal').fadeOut(100);
		});
		$('body').on('focus','.selectFolder',function(){
			var id = $(this).attr('id');
			console.log(id);
			$('#selectDirectory > div#target').html(id);
			$('#darkMask').fadeIn(50);
			$('#selectDirectory').fadeIn(100);
		});
		$('#buttonSelectDirectory').on('click',function(){
			var dir = $('#selectFile').find('span.selected').html();
			var target = $('#selectFile').find('div#target').html();
			// $('textarea[name="'+target+'"]').val(dir);
			app.active.setValue(dir);
			$('#selectFile').fadeOut(50);
			$('#darkMask').fadeOut(100);
		});
		$('#browser').on('click','.item.directory',function(){
			getBrowser($(this).html(),'#browser',true);
		});
		$('#browser').on('click','.item.updir',function(){
			var dir = $('#selectFile').find('span.selected').html();
			dir = dir.substring(0,dir.lastIndexOf("/"));
			getBrowser(dir,'#browser',true);
		});
		$('#browser').on('click','.item.file',function(){
			var file = $(this).html();
			var target = $('#selectFile').find('div#target').html();
			// $('textarea[name="'+target+'"]').val(file);
			app.active.setValue(file);
			$('#selectFile').fadeOut(50);
			$('#darkMask').fadeOut(100);
		});
		$('#saveProject').on('click',function(){
			app.save();
		});
		// getBrowser('','#browser',true);
		// getProjects();
	};
	var loadSchema = function(obName){
		if(!obName)return false;
		$.ajax({
			url:this.schema_url+obName,
			dataType:'json',
			context:this,
			success:function(m){
				if(!m)return false;
				this.settings.schema = m.results[0];
			}
		}).done(function(){
			this.reload();
		});
	}
	$('body').on('focus','textarea[name$="[path]"]',function(){
		var name = $(this).attr('name');
		var dir = $(this).val();
		// console.log(dir);
		var path = name.replace(/\]\[/g, '.');
		path = path.replace('[','.');
		path = path.replace(']','');
		app.active = app.editor.getEditor(path);
		// console.log(name);
		// console.log(app.active);
		$('#selectFile > div#target').html(name);
		$('#darkMask').fadeIn(50);
		$('#selectFile').fadeIn(100);
		getBrowser(dir,'#browser',true);
	});
	var init = function(){
		$.ajax({
			url:'settings.json',
			context:this,
			dataType:'json',
			error:function(m){throw m},
			success:function(m){
				for(i in m){
					this[i] = m[i];
				}
			}
		}).done(function(){
			document.title = this.title;
			$('#pageTitle').html(this.title);
			this.api = this.api_root+this.api_version+'/';
			this.schema_url = this.api+"schema/";
			this.loadSchema(this.root_schema);			
			this.setHandles();
			this.getProjects();
		});

	}
	return{
		init:init,
		editor:editor,
		clear:clear,
		save:save,
		settings:settings,
		projects:projects,
		project:project,
		getProjects:getProjects,
		getProject:getProject,
		reload:reload,
		loadSchema:loadSchema,
		setHandles:setHandles
	};
}());
app.init();