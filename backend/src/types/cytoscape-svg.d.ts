declare module 'cytoscape-svg' {
    import * as cytoscape from 'cytoscape';
  
    // The plugin is a function that adds functionality to the cytoscape instance
    const cytoscapeSvg: (cy: cytoscape.Core) => void;
  
    export = cytoscapeSvg;
  }
  