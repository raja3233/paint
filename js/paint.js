(function(window, document){


    createElement = function(ele, attributes){
        if(ele){
        node = typeof ele == "string"? document.createElement(ele): ele; 
        }
        if(attributes){
            
            for(var attr in attributes){
                if(attributes.hasOwnProperty(attr)){
                                    
                    if(attr in node.style)
                        node.style[attr] = attributes[attr];
                    else
                        node.setAttribute(attr, attributes[attr])
                }
            }
        }
        if(arguments){
            for(let i = 2; i < arguments.length; i++){
                let child = arguments[i];
            if(typeof child == "string")
                child = document.createTextNode(child);
            node.appendChild(child);
            }
        }
        return node;
    }

    relativePos = function(event){
        //clientx , client y gives positions with respect to viewport position of client
        //getBoundingClientRect() gives position of the box with respect to client;    
        pos = {
            x : undefined,
            y : undefined
        }
        var rect = event.target.getBoundingClientRect();          
        pos.x = event.clientX - rect.left;
        pos.y = event.clientY - rect.top;

        return pos;
    }

    var paintBoard = {
      props: {
          width:"100vw",
          height:"100vh",
          background:'gray'
      } ,
      controls : {
            fileControls:(ctx)=>{
                var toolSection = createElement('div', {class:'toolbar-section'});

               //File Input for loading image to the canvas.
                var fileInput = createElement('input', {type:'file', style:"display:none"});

                //Rasies event when input file is triggered.
                fileInput.addEventListener("change", function(){
                    if(fileInput.files.length > 0){
                        var fileReader = new FileReader();

                        //Event triggers when selected files loads by the FileReader object
                        fileReader.addEventListener('load', function(event){

                            //Render the canvas with the loaded image from the dataURL
                             var image = createElement('img');
                             image.addEventListener("load", function(){
                                ctx.drawImage(image, 0, 0);
                             });
                             //Check wheather loaded file is image or not 
                            //  alert user if  image file is not chosen else set the data url as source to image
                             if(/data:image/.test(fileReader.result)){
                                image.src = fileReader.result; 
                             }
                             else{
                                 alert('please select only image files');
                             }
                                                     
                        });

                        fileReader.readAsDataURL(fileInput.files[0])
                 
                    }
                    
                });

                //New control 
                var childcontrolNodes = Object.create(null);
                childcontrolNodes.newNode = createElement('div', {"class":'toolbar-tool new'}, fileInput, "File");
                childcontrolNodes.newNode.addEventListener('click', function(event){
                    //trigger hidden file input dom element for reading file
                   childcontrolNodes.newNode.firstChild.click(); 
                });
                // Save control 
                childcontrolNodes.saveNode = createElement('div', {"class":'toolbar-tool save'}, 'Save');
                childcontrolNodes.saveNode.addEventListener('click', function(event){
                    //read the canvas image and create a dataUrl from it
                    var href = ctx.canvas.toDataURL();

                    //image is loaded to mypainting.jpg 
                    //programatically triggers the download of the image 
                    var link = createElement('a', {"href":href, 'download':'mypainting.jpg'});
                    link.click();
                });

                //Clear canvas  
                childcontrolNodes.clear = createElement('div', {"class":'toolbar-tool clear'}, 'Clear');
                childcontrolNodes.clear.addEventListener('click', function(event){
                    //Clears the entire canvas
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                });

                 /* ADD CONTROLS TO THE TOOL SECTION */
                for(let child in childcontrolNodes){
                    toolSection.appendChild(childcontrolNodes[child]);
                }       
                return toolSection;
            },

            tools:(ctx)=>
            {
                var toolSection = createElement('div', {class:'toolbar-section'});

                var childToolNodes = Object.create(null);

                //Pencil tool. 
                // stroke width of pencil can go from 0-5px
                childToolNodes.pencil = createElement('div', {class:'toolbar-tool pencil-tool'}, "\u270E");
                childToolNodes.pencil.addEventListener('click', function(event){    
                                     
                   let selectSize = document.getElementsByClassName('size')[0].value;
                   ctx.fillStyle = 'black';
                   ctx.strokeStyle = 'black'; 
                   ctx.lineWidth = selectSize * .05;                     
                   paintBoard.controls.selectedTool = 'pencil';
                });
               
               //Text Tool.
                childToolNodes.text = createElement('div', {class:'toolbar-tool text-tool'}, "A");
                childToolNodes.text.addEventListener('click', function(event){
                   ctx.fillStyle = 'black';
                   ctx.strokeStyle = 'black';  
                    paintBoard.controls.selectedTool = 'text';
                });

                
                childToolNodes.brush = createElement('div', {class:'toolbar-tool color-picker-tool'}, "\uD83D\uDD8C");               
                childToolNodes.brush.addEventListener('click', function(event){
                    let selectSize = document.getElementsByClassName('size')[0].value;
                    ctx.fillStyle = 'black';
                    ctx.strokeStyle = 'black'; 
                    ctx.lineWidth = selectSize * .05; 
                    ctx.lineWidth = 5 + selectSize * .5; 
                    paintBoard.controls.selectedTool = 'brush';
                });

                 childToolNodes.colorPicker = createElement('div', {class:'toolbar-tool pencil-tool'}, "\uD83C\uDFA8");
                 childToolNodes.colorPicker.addEventListener('click', function(event){
                     var colorPickerNode = createElement('input',{type:'color'} );
                     colorPickerNode.click();
                     colorPickerNode.addEventListener('change', function(){
                         ctx.fillStyle = colorPickerNode.value;
                         ctx.strokeStyle = colorPickerNode.value;
                     });
                    
                });
                childToolNodes.eraser = createElement('div', {class:'toolbar-tool eraser-tool'}, "\u089C");
                childToolNodes.eraser.addEventListener('click', function(event){
                    let selectSize = document.getElementsByClassName('size')[0].value;
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = selectSize;
                    ctx.globarCompositeOperation = 'destination-out';
                    paintBoard.controls.selectedTool = 'eraser';
                });
            

                /* ADD Tools TO THE TOOL SECTION */
                for(let child in childToolNodes){
                    toolSection.appendChild(childToolNodes[child]);
                }   

                return toolSection;
            },
            
           
            sizes: (ctx)=>{
                var sizes = [1, 2, 3, 5, 7, 11, 13, 29, 61, 79, 91];
                var toolSection = createElement('div', {class:'toolbar-section'});
                var sizeSelectionNode = createElement('select', {"class":'toolbar-tool size'});

                sizeSelectionNode.addEventListener('change', function(event){
                    
                    ctx.lineWidth = (paintBoard.controls.selectedTool == 'pencil') ? sizeSelectionNode.value * .05:
                                    (paintBoard.controls.selectedTool == "brush")? sizeSelectionNode.value * .5 + 5:
                                    sizeSelectionNode.value;
                    ctx.font = sizeSelectionNode.value + 'px arial';
                });

                for(let size of sizes){
                    let optionNode = createElement('option', {value:size}, "size: " + String(size) + 'px');
                    sizeSelectionNode.appendChild(optionNode);
                }

                toolSection.appendChild(sizeSelectionNode);

                return toolSection;
            },

            colors:(ctx)=>{
                var colors = ['red', 'blue', 'green', 'orange', 'yellow', 'black']
                var toolSection = createElement('div', {class:'toolbar-section'});
                colors.forEach(function(color){

                    var colorSelectionNode = createElement('div', {class:'toolbar-tool', style:"background:"+ color +""});
                    colorSelectionNode.addEventListener('click', function(){
                    ctx.fillStyle = colorSelectionNode.style.background;
                    ctx.strokeStyle = colorSelectionNode.style.background;
                    
                });
                    toolSection.appendChild(colorSelectionNode);

                });
                
                
                
                

                return toolSection;

            },    
            selectedTool: 'pencil'       
        } ,

        
      

      getToolBar: function(props, ctx){
        var toolbar =createElement("div", props);
        var controls = this.controls;
        for(let control in controls){
            if(controls.hasOwnProperty(control) && typeof controls[control] == "function"){
                
                toolbar.appendChild(controls[control](ctx));
            }
        }
        return toolbar;       
      },

      getSketchBoardPanel: function(props, canvas){      
        var sketchBoard =createElement("div", props, canvas)   
        return  sketchBoard;
      },

      getFooter:function(props){
        var sketchBoard =createElement("div", props);
        var toolbarInfo = createElement("div", null, 'Selected Tool: ' +paintBoard.controls.selectedTool);
        setInterval(function(){
            toolbarInfo.firstChild.nodeValue = 'Selected Tool: ' + paintBoard.controls.selectedTool.charAt(0).toUpperCase() + 
                                                                    paintBoard.controls.selectedTool.slice(1);
        }, 100);
        sketchBoard.appendChild(toolbarInfo);
        return  sketchBoard;
      },

      createCanvas:function(){
          var canvas = {
            canvasEle: null,
            canvasCtx: null,
            init: function(){
                this.canvasEle = createElement("canvas", {width:'100%', height:'100%'});           
                this.canvasEle.width = window.innerWidth;
                this.canvasEle.height = window.innerHeight;
                this.canvasCtx = this.canvasEle.getContext('2d');
                this.ctxConfig();
                this.bindEvents();
            },
            ctxConfig:function(props){
                ctx = this.canvasCtx;
                if(props){
                    for(let prop in props){
                        if(ctx.hasOwnProperty(prop)){
                            ctx[prop] = props[prop]
                        }
                    }
                }
                else{
                    ctx.fillStyle = 'black';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 0.05;
                    ctx.lineCap = 'circle'
                }
            },
            

            bindEvents:function(){
                var self = this;
                var canvasCtx = self.canvasCtx;
                var drag = false;
                var textbox = false;

                function handleMove(event){
                    event.preventDefault();
                     if(drag){
                        let pos =relativePos(event);
                        canvasCtx.lineTo(pos.x, pos.y);                      
                        canvasCtx.stroke();
                    }
                }


                canvasCtx.canvas.addEventListener('mousedown', function(event){        
                    canvasCtx.beginPath();
                    let pos =relativePos(event);
                    canvasCtx.moveTo(pos.x, pos.y);
                });

                canvasCtx.canvas.addEventListener('mousemove', handleMove);

                canvasCtx.canvas.addEventListener('touchmove', handleMove);


                canvasCtx.canvas.addEventListener('click', function(event){ 
                    let selectedTool = paintBoard.controls.selectedTool;
                    if(selectedTool == 'text'){
                        var pos = relativePos(event);
                        let input = createElement('textarea', {type:"text", class:"text-tool-input", 'autofocus':true});
                        input.addEventListener('change',function(event){  
                            let lineHeight =  ctx.font.split(' ')[0]
                             pos.y = pos.y + parseInt(/[0-9]+/.exec(lineHeight)[0]);    
                             ctx.fillText(input.value, pos.x, pos.y);
                        });
                        if(textbox = !textbox){                      
                            input.style.left = event.clientX + 'px';
                            input.style.top = event.clientY + 'px';
                            input.style["line-height"] = ctx.font.split(' ')[0];
                            input.style["font-size"] = ctx.font.split(' ')[0];
                            document.body.insertBefore(input, document.body.childNodes[0]);
                       
                        }
                        else{
                             document.body.removeChild(document.body.childNodes[0]);
                        }
                        
                        
                    }   
                    
                    else{
                        drag = !drag;
                        canvasCtx.beginPath();
                        let pos =relativePos(event);
                        canvasCtx.moveTo(pos.x, pos.y);
                    }
                   
                    
                });
            }
        }
        canvas.init();
        return canvas
      },
      
      createBoard: function(){
        var paintEle = document.querySelector(".paint");
        canvas = paintBoard.createCanvas(); 
        var toolBar = paintBoard.getToolBar({"width":paintBoard.props.width, 
                                       "class":'toolbar'
                                       }, canvas.canvasCtx);
        var drawBoardPanel = paintBoard.getSketchBoardPanel({"width":paintBoard.props.width, 
                                       "height":"90%",
                                       "class":'board-panel'
                                    }, canvas.canvasEle);
                                    
        var footer = paintBoard.getFooter({"width":paintBoard.props.width,
                                        'class':'paint-footer'
        });
        createElement(paintEle,paintBoard.props, toolBar, drawBoardPanel, footer )     
      },

    };

    paintBoard.createBoard();

})(window, document);