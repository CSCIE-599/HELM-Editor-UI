# HELM-Editor-UI

This project is an undertaking by students in CSCI-E 599 to port the HELM Editor UI, which is currently written in Java Swing to HTML5 and Javascript. The initial goal is to provide a response according to the Pistoia Alliance's [RFI for a HELM web-based editor](http://www.pistoiaalliance.org/rfi-published-helm-web-based-editor/)

## helmeditor2 application

This project was generated with [yo angular generator](https://github.com/yeoman/generator-angular) version 0.15.1.

### Setting up development environment

The following steps must be done in order to set up your development environment fully.

1. Install NodeJS (version 4.3.2)

    https://nodejs.org/en/
    
2. Upgrade npm 
    
    $ sudo npm install -g npm  
    $ node -v  
    v4.3.2  
    $ npm -v  
    3.8.0

3. If desired (Yeoman was used to create the scaffolding), install Yeoman (yeoman.io)
    
    $ sudo npm install -g yo

4. Install bower
    
    $ sudo npm install -g bower

5. Install node dependencies
    
    $ npm install (you may need to run this with sudo if you get an EACCESS error)

6. Install bower dependencies
    
    $ bower install

7. Grunt targets
    ```sh    
    grunt - run all tests, build, minify, and distribute
    grunt build - build app, without running tests
    grunt serve - build app and run server locally to test manually
    grunt test - run Karma unit tests one time
    grunt test-continuous - run Karma continuously, testing with every file that's saved
    ```

## Resources

Current source code can be found here: [Pistoia Alliance GitHub](https://github.com/PistoiaHELM).
In particular, the HELM Editor in its current state can be found here: [HELM Editor 1.0](https://github.com/PistoiaHELM/HELMEditor).

Here are a couple of additional resources that have been provided:

  - [Pistoia Alliance's RFI for a HELM web-based editor 2.0](http://www.pistoiaalliance.org/rfi-published-helm-web-based-editor/)
  - [Pistoia Alliance HELM Web-based Editor RFI V1_0](https://drive.google.com/file/d/0BybDwk56P1wFQWZwXzk1bGpBUG8/view?usp=sharing)
  - [HELM Web-based Editor Requirements Specification V1_0.pdf](https://drive.google.com/file/d/0BybDwk56P1wFcC0yMEhtVk5rbjg/view?usp=sharing)
  - [Ambiguous HELM Line Notation Design.doc](https://drive.google.com/file/d/0BybDwk56P1wFSS0zVi1zWEtHZVU/view?usp=sharing)
  - [HELM Web-based Editor Conceptual Wireframes.pdf](https://drive.google.com/file/d/0BybDwk56P1wFd1UxcmlXVTdxa00/view?usp=sharing)
  - [HELM Monomer Editor Conceptual Wireframes.pdf](https://drive.google.com/file/d/0BybDwk56P1wFdVlDLXFmeDB5Zkk/view?usp=sharing)
  - [HELM Base Website](http://www.pistoiaalliance.org/projects/active-projects/hierarchical-editing-language-for-macromolecules-helm/)

Pistoia HELM Wiki: 

  - [HELM Wiki](https://pistoiaalliance.atlassian.net/wiki/display/PUB/HELM+Resources)

Updated HELM 2.0 Editor Wireframes:

  - [Updated HELM Wireframes](https://drive.google.com/file/d/0BzWuaNlFrlmkaEQ1cFpCYjRhMnhXdzRndFdZbTJ6MkR0dlFN/view?usp=sharing)

Link to existing HELM 2.0 Toolkit implementation:

  - [HELM 2.0 Toolkit initial implementation](https://github.com/MarkusWeisser)
  - [Hosted version of above toolkit](http://104.236.250.11:8080/WebService/HowToUse.html)

CSCI-E 599-specific resources:

  - [HELM Project Page](https://canvas.harvard.edu/courses/8360/pages/helm-project)

## Project Team

  - [Justin Sanford](https://github.com/jsanford8)
  - [Thankam Girija](https://github.com/thankam)
  - [Stephanie Dube](https://github.com/stephdube)
  - [Simili Abhilash](https://github.com/sabhilash)
  - [Sarah Leinecke](https://github.com/SarahL88)
  - [Chinedu Okongwu](https://github.com/cokongwu)
