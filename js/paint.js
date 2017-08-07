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

    var paintBoard = {
      props: {
          width:"100vw",
          height:"100vh",
          background:'gray'
      } ,
      controls : {
            mainControls:(ctx)=>{
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

            tools:()=>
            {
                var toolSection = createElement('div', {class:'toolbar-section'});

                var childToolNodes = Object.create(null);

                childToolNodes.brush = createElement('div', {class:'toolbar-tool pencil-tool'}, "\u270E");
                childToolNodes.brush.addEventListener('click', function(event){
                    alert("element clicked");
                    this.selectedTool = 'brush';
                });
                childToolNodes.text = createElement('div', {class:'toolbar-tool text-tool'}, "A");
                childToolNodes.text.addEventListener('click', function(event){
                    alert("element clicked");
                    this.selectedTool = 'text';
                });
                childToolNodes.colorPicker = createElement('div', {class:'toolbar-tool color-picker-tool'}, "\uD83D\uDD8C");
                childToolNodes.colorPicker.addEventListener('click', function(event){
                    alert("element clicked");
                    this.selectedTool = 'colorpicker';
                });
                childToolNodes.eraser = createElement('div', {class:'toolbar-tool eraser-tool'}, "\u089C");
                childToolNodes.eraser.addEventListener('click', function(event){
                    alert("element clicked");
                    this.slectedTool = 'eraser';
                });
            

                /* ADD Tools TO THE TOOL SECTION */
                for(let child in childToolNodes){
                    toolSection.appendChild(childToolNodes[child]);
                }   

                return toolSection;
            },
            
            shapes:()=>{
            
                var toolSection = createElement('div', {class:'toolbar-section'});

                var childShapesNodes = Object.create(null);
                childShapesNodes.circleNode = createElement('div', {"class":'toolbar-tool shape'}, '\u25CB');
                childShapesNodes.rectNode = createElement('div', {"class":'toolbar-tool shape'}, '\u25A1');
                childShapesNodes.lineNode = createElement('div', {"class":'toolbar-tool shape'}, '\u2015');
                childShapesNodes.cubicNode = createElement('div', {"class":'toolbar-tool shape'}, '\u223c');
                childShapesNodes.triangleNode = createElement('div', {"class":'toolbar-tool shape'}, '\u25B3');
               

                 /* ADD CONTROLS TO THE TOOL SECTION */
                for(let child in childShapesNodes){
                    toolSection.appendChild(childShapesNodes[child]);
                }   
                return toolSection;
            },

            

            selectedTool : 'brush'
            
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

      createCanvas:function(){
          var canvas = {
            canvasEle: null,
            canvasCtx: null,
            init: function(){
                this.canvasEle = createElement("canvas", {width:'100%', height:'100%'});           
                this.canvasEle.width = 1024;
                this.canvasEle.height = 1024;
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
                    if(paintBoard.controls.selectedTool == 'brush')
                    ctx.fillStyle = 'black';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 1;
                    ctx.lineCap = 'circle'
                }
            },
            bindEvents:function(){
                var canvasCtx = this.canvasCtx;
                var drag = false;
                canvasCtx.canvas.addEventListener('mousedown', function(event){         
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(event.offsetX - canvasCtx.canvas.getBoundingClientRect().left, event.offsetY-canvasCtx.canvas.getBoundingClientRect().top);
                    
                });

                canvasCtx.canvas.addEventListener('mousemove', function(event){                   
                    if(drag){
                        canvasCtx.lineTo(event.offsetX -canvasCtx.canvas.getBoundingClientRect().left, event.offsetY-canvasCtx.canvas.getBoundingClientRect().top);
                        canvasCtx.stroke();
                    }
            
                });

                canvasCtx.canvas.addEventListener('click', function(event){ 
                    drag = !drag;
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(event.offsetX -canvasCtx.canvas.getBoundingClientRect().left, event.offsetY-canvasCtx.canvas.getBoundingClientRect().top);
                    
                });
            }
        }
        canvas.init();
        return canvas
      },
      
      createBoard: function(){
        var paintEle = document.querySelector(".paint");
        canvas = this.createCanvas(); 
        var toolBar = this.getToolBar({"width":this.props.width, 
                                       "class":'toolbar'
                                       }, canvas.canvasCtx);
        var drawBoardPanel = this.getSketchBoardPanel({"width":this.props.width, 
                                       "height":"90%",
                                       "class":'board-panel'
                                       }, canvas.canvasEle);
        createElement(paintEle,this.props, toolBar, drawBoardPanel )     
      },

    };

    paintBoard.createBoard();
})(window, document);