import React, { Component } from 'react';
import gsap from "gsap";
import Draggable from "gsap/Draggable";

import classnames from 'classnames';
import debounce from 'lodash/debounce';
import delay from 'lodash/delay';

gsap.registerPlugin(Draggable);

//  set up global carousel variables so that we can access them from easily anywhere inside our component
let swipeDir = null;
let numSlides = 0;
let activeSlide = 0;
const slideSpeed = .35;

class Carousel extends Component {

  constructor(props) {
    super(props);
    this.carousel = null;
    this.carouselWindow = null;

    this.state = {
      reachedStart: false,
      reachedEnd: false,
      itemWidth: 0
    }

    this.animateSlide = this.animateSlide.bind(this);
    this.goToSlide = this.goToSlide.bind(this);
    this.checkUrl = this.checkUrl.bind(this);
    this.measureAfterResize = debounce(this.measureAfterResize, 500);
  }

  aomponentDidMount () {
    window.scrollTo(0,0);

    // count the number of slides passed through in the data object and measure the width of the carousel
    numSlides = this.props.data.length;

    this.measureCarousel();
    this.checkUrl(this.props.curUrl);

    Draggable.create('.foo', {
      type:'x'
    });
  }

  componentDidMount() {
    window.scrollTo(0,0);

    // count the number of slides passed through in the data object and measure the width of the carousel
    numSlides = this.props.data.length;

    this.measureCarousel();
    this.checkUrl(this.props.curUrl);

    // create the greensock draggable and attach the updating of the activeSlide number and history to the onDragEnd method
    Draggable.create(this.carouselWindow, {
      type:'x',
      edgeResistance: 0.90,
      dragResistance: 0.0,
      bounds: this.carousel,
      onDrag: this.updateDirections,
      throwProps: true,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onDragEnd : (self) => {
        if(swipeDir === 'left') {
          activeSlide ++;
        }
        else if(swipeDir === 'right') {
          activeSlide --;
        };

        if(activeSlide >= numSlides-1) activeSlide = numSlides-1;
    		if(activeSlide <= 0) activeSlide = 0;
        this.animateSlide(slideSpeed);
      }
    });

    // navigate to the correct slide once the draggable has been created
    delay(() => {
      this.animateSlide('0');
    }, 1);

    // add the listener for window resize event
    window.addEventListener('resize', this.measureAfterResize);
  }

  // internal greensock draggable method that determines which way carousel was swiped
  updateDirections() {
    swipeDir = this.getDirection('start');
  }

  measureAfterResize = () => {
    this.measureCarousel();
  }

  measureCarousel() {
    if(this.carousel === null) {
      return;
    }

    delay(() => {
      // measure the width of the carousel and store it in itemWidth. This is a state so we can always update it if needed
      const itemWidth = Math.round(this.carousel.offsetWidth);
      this.setState({ itemWidth: itemWidth });
      this.animateSlide('0');
    }, 1);
  }

  animateSlide(speed) {
    // move the carousel left or right to the currently active slide
    const xTarget = ((activeSlide * (this.state.itemWidth + 20)) * -1);

    if(this.carouselWindow === null) {
      return;
    }

    gsap.to(this.carouselWindow, {
      duration: speed,
      x: xTarget,
      ease: "power4.inout"
    });

    // update reachedStart and reachedEnd. These set the max and min bounds to which the slider can move.
    // when on the first slide, disable the possibility of going further back
    // when on the last slide, disable the possibility of going further forward
    activeSlide === 0 ? this.setState({ reachedStart: true }) : this.setState({ reachedStart: false });
    activeSlide + 1 === numSlides ? this.setState({ reachedEnd: true}) : this.setState({ reachedEnd: false});
  }

  goToSlide(slide, animate) {
    let speed = null;
    animate ? speed = slideSpeed: speed = '0';

    if(slide === 'next' && this.state.reachedEnd === false) {
      activeSlide ++;
    }

    if(slide === 'prev' && this.state.reachedStart === false) {
      activeSlide --;
    }

    // instead of next or previous, the url of a slide was passed as argument
    else {
      this.checkUrl(slide);
    }

    this.animateSlide(speed);
  }

  checkUrl(url) {
    // check the index in the json of the url being requested
    const index = this.props.data.findIndex(function(item, i){
      return item.url === url;
    });

    // confirm that the url exists in the json. If so, update the activeSlide variable
    if(index > -1) {
      activeSlide = index;
    }
  }

  render() {
    const { data } = this.props;

    const slides = data.map((slide, index) => {

      let renderImage = null;
      switch(index) {
        case activeSlide-1:
        case activeSlide:
        case activeSlide+1:
          renderImage = <img src={`images/${slide.image}`} alt={slide.title} />;
          break;
        default:
          renderImage = null;
          break;
      }
      return (
        <div className={classnames({ "carousel__slide": true, "carousel__slide--active": index === activeSlide })  }
          key={slide.id}>
          {renderImage}
        </div>
      )
    });

    const slideTitle = this.props.data[activeSlide].title;
    const slideText = this.props.data[activeSlide].text;

    return(
      <div className="carousel" ref={div => this.carousel = div}>
        <div className="carousel__visual">
          <div
            className="carousel__window"
            ref={div => this.carouselWindow = div}>
            { slides }
          </div>
          <span
            className={classnames({ 'carousel__nav carousel__nav--prev': true, 'carousel__nav--inactive': this.state.reachedStart })}
            onClick={() => this.goToSlide('prev')} />
          <span
            className={classnames({ 'carousel__nav carousel__nav--next': true, 'carousel__nav--inactive': this.state.reachedEnd })}
            onClick={() => this.goToSlide('next')} />
        </div>

        <div className="carousel__info">
          <h3>{slideTitle}</h3>
          <p>{slideText}</p>
        </div>
      </div>
    )
  }
}

export default Carousel;
