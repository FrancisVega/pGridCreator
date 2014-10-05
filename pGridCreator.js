// pGridCreator
// Part of Mêlée Tools
//
// twitter: @francis_vega
// web: www.inartx.com

// CS2 and higher
#target photoshop

// Hey, wake up!
app.bringToFront();


if (isOpen()) {
    // Global Doc
    docRef = app.activeDocument

    // One entry in history and execute main
    docRef.suspendHistory("pGridCreator", "main()");
}

/*
    Main function
*/
function main() {

    var pGridCreator = function() {
        this.docWidth = docRef.width
        this.docHeight = docRef.height
    }


    /*
        Establece las medidas del grid en base a un objeto (preset) con los parámetros
        @param gridObject: Un objeto con los parámetros del grid
    */
    pGridCreator.prototype.setGrid = function(gridObject) {
        this.containerWidth = gridObject["containerWidth"]
        this.ncols = gridObject["ncols"]
        this.glutter = gridObject["glutter"]
        this.topMargin = gridObject["topMargin"]
        this.rightMargin = gridObject["rightMargin"]
        this.bottomMargin = gridObject["bottomMargin"]
        this.leftMargin = gridObject["leftMargin"]
        this.centerGrid = gridObject["centerGrid"]
        this.edgeGuides = gridObject["edgeGuides"]
        this.columsGuides = gridObject["columnsGuides"]
        this.glutterGuides = gridObject["glutterGuides"]
        this.groupName = gridObject["groupName"]

    }


    /*
        Calcula el tamaño final de cada columna
        @out: Devuelve el tamaño de la columna como número entero
    */
    pGridCreator.prototype.calcColumnWidth = function() {
        return Math.round(((this.containerWidth-(this.glutter*(this.ncols-1)))-(this.leftMargin+this.rightMargin)) / this.ncols)
    };


    /*
        Devuelve la posición top-left (x) de cada columna
        @out: un array con las posiciones
    */
    pGridCreator.prototype.getColsPositions = function() {
        var pos = new Array()
        var i
        var colWidth = this.calcColumnWidth()
        for (i=0;i<this.ncols;i++) {
            pos.push(((i*(colWidth+this.glutter))+this.leftMargin))
        }
        return pos
    }


    /*
        Devuelve la posición top-left (x) de cada borde guía
        @out: Un array de dos elementos con la posición de cada guía de los bordes
    */
    pGridCreator.prototype.getEdgePositions = function() {
        var pos = new Array()

        pos[0] = 0
        pos[1] = this.containerWidth + pos[0] - 1

        return pos
    }


    /*
        Devuelve las posiciones (array de 4 pares de valores) para hacer la selección de las columnas
        @out: Un array con los valores (array de 4 pares de valores) para cada columna
    */
    pGridCreator.prototype.getColLayerPos = function() {
        var colPosArray = new Array()
        var colWidthPositions = this.getColsPositions()
        for (i=0;i<this.ncols;i++) {

            var newColPos = [
                [ colWidthPositions[i], 0 ],
                [ colWidthPositions[i]+this.calcColumnWidth(), 0 ],
                [ colWidthPositions[i]+this.calcColumnWidth(), this.docHeight ],
                [ colWidthPositions[i], this.docHeight ]
            ]

            colPosArray.push(newColPos)
        }
        return colPosArray
    }


    /*
        Devuelve las posiciones (array de 4 pares de valores) para hacer la selección de las guías de los bordes
        @out: Un array con los valores (array de 4 pares de valores) para cada guía de borde
    */
    pGridCreator.prototype.getEdgesLayerPos = function() {

        var colPosArray = new Array()
        var colWidthPositions = this.getEdgePositions() // 2 items of x coords

        colPosArray[0] = [
            [colWidthPositions[0], 0],
            [colWidthPositions[0] + 1, 0],
            [colWidthPositions[0] + 1, this.docHeight],
            [colWidthPositions[0], this.docHeight]
        ]

        colPosArray[1] = [
            [colWidthPositions[1], 0],
            [colWidthPositions[1] + 1, 0],
            [colWidthPositions[1] + 1, this.docHeight],
            [colWidthPositions[1], this.docHeight]
        ]

        return colPosArray
    }


    /*
        Crea una capa bitmap a modo de columna
        @param layerName: nombre que tendrá la capa en photoshop
        @param selection: array con la selección de photoshop para crear posteriormente el relleno
        @param color: color para el relleno basado en key:value
        @out: Devuelve la capa creada

    */
    pGridCreator.prototype.createBitmapColumn = function(layerName, selection, layerOpacity, color) {

        // Todo: crear un diccionario key:value para colores fuera de la función
        if (color=="red") {
            var fillColor = new SolidColor()
            fillColor.rgb.red = 255
            fillColor.rgb.green = 0
            fillColor.rgb.blue = 0
        }

        if (color=="green") {
            var fillColor = new SolidColor()
            fillColor.rgb.red = 0
            fillColor.rgb.green = 255
            fillColor.rgb.blue = 0
        }

        if (color=="blue") {
            var fillColor = new SolidColor()
            fillColor.rgb.red = 97
            fillColor.rgb.green = 150
            fillColor.rgb.blue = 220
        }

        if (color=="black") {
            var fillColor = new SolidColor()
            fillColor.rgb.red = 0
            fillColor.rgb.green = 0
            fillColor.rgb.blue = 0
        }

        if (color=="white") {
            var fillColor = new SolidColor()
            fillColor.rgb.red = 255
            fillColor.rgb.green = 255
            fillColor.rgb.blue = 255
        }

        // Add photoshop layer
        var theLayer = docRef.artLayers.add()
        // Rename it
        theLayer.name = layerName
        // move it to group
        theLayer.move(this.g, ElementPlacement.INSIDE)
        // Make a photoshop selection
        docRef.selection.select(selection)
        // Fill the selection with color
        docRef.selection.fill(fillColor, ColorBlendMode.NORMAL, layerOpacity, false)

        // Devolvemos la capa
        return theLayer

    }


    /*
        Pinta las columnas
    */
    pGridCreator.prototype.paint = function() {
        var colpos = this.getColLayerPos()
        var edgepos = this.getEdgesLayerPos()
        var columnWidth = this.calcColumnWidth()

        // Create group
        this.g = docRef.layerSets.add()
        this.g.name = this.groupName

        // Create columns
        for(var i=0;i<this.ncols;i++) {
            this.createBitmapColumn('column', colpos[i], 30, "blue")
        }

        // Create edges
        if(this.edgeGuides) {
            this.createBitmapColumn('left-edge', edgepos[0], 100, "red")
            this.createBitmapColumn('right-edge', edgepos[1], 100, "red")
        }

        // Create center colums guides
        if(this.columnsGuides) {
            for(var i=0;i<this.ncols;i++) {
                this.createBitmapColumn('mid-column-guide',
                    [
                        [colpos[i][0][0]+(Math.round(columnWidth/2)), 0],
                        [colpos[i][0][0]+(Math.round(columnWidth/2))+1, 0],
                        [colpos[i][0][0]+(Math.round(columnWidth/2))+1, this.docHeight],
                        [colpos[i][0][0]+(Math.round(columnWidth/2)), this.docHeight]
                    ],
                100, "white")
            }
        }

        // Create center glutter guides
        if(this.glutterGuides) {
            for(var i=1;i<this.ncols;i++) {
                this.createBitmapColumn('mid-glutter-guide',
                    [
                        [colpos[i][0][0]-(Math.round(this.glutter/2)), 0],
                        [colpos[i][0][0]-(Math.round(this.glutter/2))+1, 0],
                        [colpos[i][0][0]-(Math.round(this.glutter/2))+1, this.docHeight],
                        [colpos[i][0][0]-(Math.round(this.glutter/2)), this.docHeight]
                    ],
                50, "blue")
            }

            if(this.leftMargin > 0) {
                // add first glutter guide
                this.createBitmapColumn('first-glutter-guide',
                    [
                        [colpos[0][0][0]-(Math.round(this.glutter/2)), 0],
                        [colpos[0][0][0]-(Math.round(this.glutter/2))+1, 0],
                        [colpos[0][0][0]-(Math.round(this.glutter/2))+1, this.docHeight],
                        [colpos[0][0][0]-(Math.round(this.glutter/2)), this.docHeight]
                    ],
                50, "blue")
            }

            if(this.rightMargin > 0) {
                // add last glutter guide
                this.createBitmapColumn('last-glutter-guide',
                    [
                        [colpos[this.ncols-1][0][0]+(Math.round(columnWidth+(this.glutter/2))), 0],
                        [colpos[this.ncols-1][0][0]+(Math.round(columnWidth+(this.glutter/2)))+1, 0],
                        [colpos[this.ncols-1][0][0]+(Math.round(columnWidth+(this.glutter/2)))+1, this.docHeight],
                        [colpos[this.ncols-1][0][0]+(Math.round(columnWidth+(this.glutter/2))), this.docHeight]
                    ],
                50, "blue")
            }
        }

        // Clear selection
        docRef.selection.deselect()

        // Center grid

        if(this.centerGrid) {
            docRef.activeLayer = this.g
            docRef.selection.selectAll()
            this.g.translate(Math.round((this.docWidth-this.containerWidth)/2),0)
        }
    }


    /*
        Help method for grid presets
        @param presetName: A predefined preset name
        @out: preset object
    */
    pGridCreator.prototype.preset = function(presetName) {
        switch(presetName) {

            // bootstrap 12 cols
            case "bootstrap-12-cols":
                return {
                    "containerWidth": 1170,
                    "ncols": 12,
                    "glutter": 30,
                    "topMargin": 0,
                    "rightMargin": 30,
                    "bottomMargin": 0,
                    "leftMargin": 30,
                    "centerGrid": true,
                    "edgeGuides": true,
                    "columnsGuides": true,
                    "glutterGuides": true,
                    "groupName": "grid"
                }

            // bootstrap 12 cols no margin
            case "bootstrap-12-cols-nomargin":
                return {
                    "containerWidth": 1170,
                    "ncols": 12,
                    "glutter": 30,
                    "topMargin": 0,
                    "rightMargin": 0,
                    "bottomMargin": 0,
                    "leftMargin": 0,
                    "centerGrid": true,
                    "edgeGuides": true,
                    "columnsGuides": true,
                    "glutterGuides": true,
                    "groupName": "grid"
                }

            // iPhone 5 4cols
            case "iPhone5-4-cols":
                return {
                    "containerWidth": 640,
                    "ncols": 4,
                    "glutter": 40,
                    "topMargin": 0,
                    "rightMargin": 40,
                    "bottomMargin": 0,
                    "leftMargin": 40,
                    "centerGrid": true,
                    "edgeGuides": true,
                    "columnsGuides": true,
                    "glutterGuides": true,
                    "groupName": "grid"
                }

            // 1366 full 12 columnas
            case "1366-12-cols-nomargin":
                return {
                    "containerWidth": 1366,
                    "ncols": 12,
                    "glutter": 40,
                    "topMargin": 0,
                    "rightMargin": 0,
                    "bottomMargin": 0,
                    "leftMargin": 0,
                    "centerGrid": true,
                    "edgeGuides": false,
                    "columnsGuides": false,
                    "glutterGuides": true,
                    "groupName": "grid"
                }

            // Default
            default:
                return false
        }
    }


    // Main
    var pGridCreator = new pGridCreator()

    // var preset = pGridCreator.preset("bootstrap-12-cols")
    var preset = pGridCreator.preset("1366-12-cols-nomargin")

    // Set the preset before creation
    pGridCreator.setGrid(preset)

    // Create the grids
    pGridCreator.paint()

}

/*
    Comprueba que existe al menos un documento abierto
*/
function isOpen() {
    if (documents.length) {
        return true;
    } else {
        alert('There are no documents open.', 'No Documents Open', false);
        return false;
    }
}