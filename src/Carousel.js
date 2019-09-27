import React, { Component } from 'react';
import { TweenLite, Power4 } from "gsap";
import Draggable from "gsap/Draggable";

import classnames from 'classnames';
import debounce from 'lodash/debounce';
import delay from 'lodash/delay';

//  set up global variables so that we can access them from easily anywhere inside our component
let swipeDir = null;
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
      itemWidth: 0,
      dragging: false
    }

    this.navigateSlide = this.navigateSlide.bind(this);
    this.slideUpdated = this.slideUpdated.bind(this);
    this.moveSlide = this.moveSlide.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.checkUrl = this.checkUrl.bind(this);
    this.measureAfterResize = debounce(this.measureAfterResize, 500);
  }

  componentDidMount() {
    // count the number of slides passed through in the json object and measure the width of the carousel
    const numSlides = this.props.data.length;
    this.measureCarousel();

    // create the greensock draggable and attach the updating of the activeSlide number to the onDragEnd method
    Draggable.create(this.carouselWindow, {
      type:'x',
      edgeResistance: 0.90,
      dragResistance: 0.0,
      bounds: this.carousel,
      onDrag: this.updateDirections,
      throwProps: true,
      onDragEnd : (self) => {
        if(swipeDir === 'left') {activeSlide ++}
        else if(swipeDir === 'right') {activeSlide --};

        if(activeSlide >= numSlides-1) activeSlide = numSlides-1;
    		if(activeSlide <= 0) activeSlide = 0;
        this.navigateSlide();
      }
    });

    // check if the page was loaded from another url than the first, default, slide and update the index of activeSlide
    this.checkUrl();
    this.slideUpdated();
    window.addEventListener('resize', this.measureAfterResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.measureAfterResize);
  }

  updateDirections() {
    swipeDir = this.getDirection("start");
  }

  navigateSlide(time) {
    // move the carousel left or right to the currently active slide
    const xTarget = ((activeSlide * (this.state.itemWidth + 20)) * -1);
    let speed = null;
    time ? speed = time: speed = slideSpeed;

    TweenLite.to(this.carouselWindow, speed, {x: xTarget, ease: Power4.EaseInOut });
    this.slideUpdated();
  }

  checkUrl() {
    // check if the url we're on is the first, default slide. If not, find the index in the json of the current url
    const curUrl = this.props.location.pathname.split('/').pop();
    if(curUrl !== this.props.data[activeSlide].url) {
      const index = this.props.data.findIndex(function(item, i){
        return item.url === curUrl;
      });

      // confirm that curUrl exists in the json. If so, navigate to that slide
      if(index > -1) {
        activeSlide = index;

        // the 1 millisecond delay is needed to make sure the correct itemWidth has been measured
        delay(() => {
          this.navigateSlide('0');
        }, 1);
      }
    }
  }

  slideUpdated () {
    const numSlides = this.props.data.length;

    // update reachedStart and reachedEnd. These set the max and min bounds to which the slider can move.
    // when on the first slide, disable the possibility of going further back
    // when on the last slide, disable the possibility of going further forward
    activeSlide === 0 ? this.setState({ reachedStart: true }) : this.setState({ reachedStart: false });
    activeSlide + 1 === numSlides ? this.setState({ reachedEnd: true}) : this.setState({ reachedEnd: false});

    const curUrl = this.props.data[activeSlide].url;
    this.props.history.push(curUrl);
  }

  // bump up the activeSlide index by 1 or subtract one depending on which way the slider is being moved
  moveSlide(direction) {
    if(direction === 'next' && this.state.reachedEnd === false) {
      activeSlide ++;
    }

    if(direction === 'prev' && this.state.reachedStart === false) {
      activeSlide --;
    }

    this.navigateSlide();
  }

  measureAfterResize = () => {
    this.measureCarousel();
  }

  measureCarousel() {
    // measure the width of the carousel and store it in itemWidth. This is a state so we can always update it if needed

    const itemWidth = this.carousel.offsetWidth;
    this.setState({ itemWidth: itemWidth });
    this.navigateSlide('0');
  }

  // mouseDown and mouseUp simply toggle a className used for styling the cursor when dragging
  mouseDown() {
    this.setState({ dragging: true });
  }

  mouseUp() {
    this.setState({ dragging: false });
  }

  render() {
    const { data } = this.props;

    const slides = data.map((slide, index) => {
      return (
        <div className={classnames({ "carousel__slide": true, "carousel__slide--active": index === activeSlide })  }
          key={slide.id}
          onMouseDown={this.mouseDown}
          onMouseUp={this.mouseUp}>
          <img src={`images/${slide.image}`} alt={slide.title} />
        </div>
      )
    });

    const slideTitle = this.props.data[activeSlide].title;
    const slideText = this.props.data[activeSlide].text;

    return(
      <div className="carousel" ref={div => this.carousel = div}>
        <div className="carousel__visual">
          <div
            className={classnames({ "carousel__window": true, "carousel__window--dragging": this.state.dragging }) }
            ref={div => this.carouselWindow = div}>
            { slides }
          </div>
          <span
            className={classnames({ 'carousel__nav carousel__nav--prev': true, 'carousel__nav--inactive': this.state.reachedStart })}
            onClick={() => this.moveSlide('prev')} />
          <span
            className={classnames({ 'carousel__nav carousel__nav--next': true, 'carousel__nav--inactive': this.state.reachedEnd })}
            onClick={() => this.moveSlide('next')} />
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
