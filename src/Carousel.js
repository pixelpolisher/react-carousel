import React, { Component } from 'react';
import { TweenLite, Power4 } from "gsap";
import Draggable from "gsap/Draggable";

import classnames from 'classnames';
import debounce from 'lodash/debounce';

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
    this.slideDone = this.slideDone.bind(this);
    this.moveSlide = this.moveSlide.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.measureAfterResize = debounce(this.measureAfterResize, 500);
  }

  componentDidMount() {
    const numSlides = this.props.data.length;
    this.measureCarousel();

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

    this.slideDone();
    window.addEventListener('resize', this.measureAfterResize);
  }

  updateDirections() {
    swipeDir = this.getDirection("start");
  }

  navigateSlide(time) {
    const xTarget = ((activeSlide * (this.state.itemWidth + 20)) * -1);
    let speed = null;
    time ? speed = time: speed = slideSpeed;

    TweenLite.to(this.carouselWindow, speed, {x: xTarget, ease: Power4.EaseInOut });
    this.slideDone();
  }

  slideDone () {
    const numSlides = this.props.data.length;

    activeSlide === 0 ? this.setState({ reachedStart: true }) : this.setState({ reachedStart: false });
    activeSlide + 1 === numSlides ? this.setState({ reachedEnd: true}) : this.setState({ reachedEnd: false});
  }

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
    const itemWidth = this.carousel.offsetWidth;
    this.setState({ itemWidth: itemWidth });
    this.navigateSlide('0');
  }

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
