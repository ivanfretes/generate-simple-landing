// -- Main --
$(function(){

	// Eliminamos cualquier elemento
	removeElement('click');
	
	
    // Remove page
//    removeItem( 'click', 'data-page', 'a.btn-danger', '#page_list tr');
//    
    // Remove a page component
//    removeItem( 'click', 'data-widget', 'a[data-type=remove]' , 
//                'ul#component_created', 'ul#component_created li');
//    
    
    // Remove a menu    
    //remove_item('click', '#menu_created li a', 'li');
    
    // Set the grid data
    // Actualizamos el componente del tipo imagen
    // elemento paterno li[data-structure=grid]
    //send_form_grid('change', 'li[data-structure=grid] input[type=file]');
    //send_form_grid('keyup', 'li[data-structure=grid] input[type=text]');
    
    
    // Set the row
    // Actualizamos el componente del tipo fila
    // li[data-type-widget=single_row] podria se elemento paterno si no ajusta a 
    // las actuales necesidades
    send_row('keyup', 'li[data-type-widget=single_row] input[type=text]'); //
    send_row('change', 'li[data-type-widget=single_row] select'); 
    send_row('change', 'li[data-type-widget=single_row] input[type=file]');
  
    //ssend_row('change', ' input[type=file]');
    
    /**
    * -- Pages -- 
    */
    
    // Seleccionamos el componente a ser creado para generar sus caracteristicas
    $('input[name=p_title]').keyup(function(){
         $('input[name=p_url]').val(createSlug($(this).val()));
        
    });
    
    $('input[name=p_url]').keyup(function(){
        $(this).val(createSlug($(this).val()));
    });
    
    
    /*
        -- Edit/adding and send data --
    */
    
    // Enviamos datos a traves del formulario
    send_data_with_form('#menu_form, #p_form');
    
    
    // Volvemos editable 'summernote' al componente seleccionado
    summernote_content('div[data-action=editable]');
    
    // Modificar
    $('#p_btn_modal').click(function(){
        $('#p_errors').html('');
    });
   
    
    // Modificamos el orden den menu
    $("#menu_created").sortable({ 
        placeholder: "ui-state-highlight", 
        stop: function( event, ui ) {
            set_order({
                url : GESTION_URL+'menu/ordered',
                selected : '#menu_created li',
                selected_data : 'data-menu'
            });
        }  
    });
 
    // Seleccionamos un nuevo componente para su creacion
    $('#select_component').on('change',function(){
		var self = $(this);
		// Componente seleccionado 'portfolio'
        var component = self.val();
        
        //NProgress.start();
        
        if ('' !== component){
            if (confirm('Desea crear un nuevo componente')){
                order_component++;
                
                // type_component a string for example 'single_row' or 'portfolio'
                $.post(GESTION_URL+'widgets/add/'+component, 
                {
                    page : page_id,
                    order : order_component 
                })
                .done(function(data,status) {
                    load_component(component,data,order_component);
                    //NProgress.done();
					self.val('');
                });
            }
        }
    });

});



    
/*
	Creamos un nuevo componente
	
	@param {number} widget_id : Id del widget
	@param {}
	@param {number} 
*/

function new_component(type_component,data_component, order){
    //$('#component_created').append(data_component);
    //location.assign('#button');
}




/*
	Ordenamos los widgets
*/
@example obj_param = {
		url : destiny
		selected : li or div to each ,
		selected_data : field/attr data_[any] of the selector       
    }
*/

function set_order(obj_param = {}, e = null){
	
	// Listado de widgets
    var item_list = [];
	
    // Recorre todos los elementos 
    $.each($(obj_param.selected), function(k, v) {
       order_component.push($(v).attr(obj_param.selected_data));
    });

	// Anexamos el array con los id dispuestos
	obj_param.order = order_component;

    $.post(obj_param.url, obj_param, function(data){
        var data = JSON.parse(data);
        
        
    })
}




/*
	Envia datos del component tipo fila
	
	@param {string} event : 
*/
function send_row(event, element){
    
    $('#component_created').delegate(element, event, function(e){ 
        
        var self = $(this);
        var form = self.parents('form'); // formulario padre
		
		//datos del formulatio, indicamos cual
        var formData = new FormData(document.getElementById(form.attr('id')));  
        
		set_thumbnail(e, '.row-image-container img');
		
		
		console.log('Limpiamos el componente fila');
		return;
		
        // Add the blob over the form data object, 
        // El componente representa el id del tipo actual de widget creado, por ejemplo 
        // el id de un item de portfolio
        formData.append('component_id', form.attr('data-component'));

        $.ajax({
            url: form.attr('action'),
            type: "post",   
            dataType: "html",
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        })
        .done(function(data){
			console.log(data);
			$('input[type=file]').val(null);
        });

    });
    
}

/*
    Envia los datos contenidos en un formulario
*/
function send_data_with_form(selector, event = 'submit'){

    try {
        
        //if (null === selector) 
        //    var err = 'Formulario no inicializado';
        
        $(selector).on(event, function(e){
            var f = $(this); // form selected
            e.preventDefault();
            
            var formData = new FormData(document.getElementById(f[0].id));
            
            
            // Se inicializa para editar cualquier componente
            if ('undefined' !== typeof f.attr('data-component')){
                formData.append('component_id',f.attr('data-component'));
            }
            
            
            // Send the data
            $.ajax({
                url: f[0].action,
                type: "post",   
                dataType: "text",
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            })
            .done(function(data){
                var data = JSON.parse(data);
                
                if (0 !== data.error){
                    $('#p_errors').html(`
                        <div class="alert alert-danger alert-dismissible fade in" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                            `+data.msg+`
                        </div>`);
                }
                else {
                    location.reload();
                }

            });
        });
                       
    }
    catch(err){
        console.log(err);
    }
}



/*
    Utilizamos 'summernote.js' para agregar un toolbar 
	de edicion al contenido.
	(*) utiliza un delegate por si el div, fuese generado dinamicamente
	
	@param {string} element : Representa al elemento que es seleccionado
	@param {string} event : Evento realizado sobre el elemento(element)
	
	@return void 
*/

function summernote_content(element, event = 'click'){
    $('body').delegate(element, event, function(e){
        var self = $(this); 
		
		// Verficamos que el data action sea editable
        if ('editable' === self.attr('data-action')){
			
			console.log(self.attr('data-action'));
			
            // Summernote setting
            $(this).summernote({
                //height: 300, 
                minHeight: null,
                maxHeight: null, 
                focus: true,
                lang: 'es-ES',
                placeholder: 'Editar Contenido [ aquí ]',
                callbacks: {
                    onInit: function() {
                        console.log('Summernote is launched');
                    },
					// Envia los datos, del box si son modificados
                    onChange: function(content){
						
						var form =  self.parents('form'); //form padre
						// Llama a los datos del for  
						var formData = new FormData(
							 			document.getElementById(form.attr('id')));
						

                        // El componente representa el id del tipo actual de widget creado, por ejemplo 
                        // el id de un item de portfolio
						
                        formData.append('component_id', form.attr('data-component'));
                        
                        // Extrae del id, el 'keyname' que enviar mediante el ajax
                        // por ejemplo 'page_name', y le asigna su contenido 'content'
						
						
                        var component_name = self.attr('id');
                        formData.append(component_name, content); 

                        
                        $.ajax({
                            url: form.attr('action'),
                            type: 'post',
                            data: formData,
                            cache: false,
                            contentType: false,
                            processData: false
                        })
                        .done(function(data){
                            console.log(data);
                        });
                        
                    },
                    onBlur: function(c) {
                        console.log(c);
                    }
                }
            });
            


        }
    });
}






/*
	Envia los datos del formulario, 
	cuando se produce algun en un elemento del formulario
*/

function send_form(element, event = 'change'){
	
	
	// Creamos un formulario
	var formParent = $(element).parent('form');  
	var formData = new FormData();
	
	
	 $.ajax({
		url: formParent.attr('action'),
		type: "post",   
		dataType: "html",
		data: formData,
		cache: false,
		contentType: false,
		processData: false
	})
	.done(function(data){
		console.log(data);
	});

}



/*
	Envia datos de cualquier formulario, un elemento a la vez
	
	@param 
*/	

function send_form_data(element, event = 'click'){
	$(body).delegate(element, event, function(){
		console.log('Inicializamos la applizacion');
	});
	
	
}



/*
	
	@param {string} fn : nombre de la funcion
	@param {string} param : nombre de el/los parametros
	@param

*/
function msgFnError(fn,param,msg = '--'){
	return 'Fn: '+fn+' \nParam: '+param+' \nMsg: '+msg;
}

// Seleccionamos la nueva portada
$('#page_portada_input').change(function(e){
	set_thumbnail(e, '#page-portada-image');
});