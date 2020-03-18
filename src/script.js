'use strict';

class Card {
	constructor(suit, value) {
		this.suit = suit;
		this.value = value;
  	}
}

class Table {
	constructor() {
		this.suits = ["Hearts", "Clubs", "Diamonds", "Spades"];
		this.values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
		this.gameSet = this.newGameTable();
	}

	deckOfCards() {
		let deck = [];
		for (let suit of this.suits) {
			for (let value of this.values) {
				deck.push(new Card(suit, value));
			}
		}
		return deck
	}

	shuffleDeck() {
		let shuffled = this.deckOfCards();
		for (let i = 51; i > 0; i--) {
			const j = Math.floor(Math.random() * i)
			const temp = shuffled[i]
			shuffled[i] = shuffled[j]
			shuffled[j] = temp
		}
		return shuffled
	}

	newGameTable() {
		const deck = this.shuffleDeck()
		const gameSet = {
			table: [],
			stack: [],
		}
		for (let i = 0; i < 7; i++) {
			gameSet.table[i] = [];
			for (let j = 0; j <= i; j++ ) {
				gameSet.table[i].push(deck.pop());
			}
		}
		gameSet.stack = deck
		return gameSet
	}
}


class Solitaire {
	constructor() {
		this.model = new Table();
		this.renderGame();

		let gameTable = document.querySelector(".gameTable");
        let hiddenStack = document.querySelectorAll('.stack.placeholder')[0];
        let visibleStack = document.querySelectorAll('.stack.placeholder')[1];
        let tableColumns = document.querySelectorAll('.tableColumn');
        let suitsColumns = document.querySelectorAll('.suitColumn');

        let draggedItem = null;
        let draggedCard = null;
        let fromColumn = null;

        for (let column of tableColumns) {
        	// Card dragged from table column
        	column.addEventListener('dragstart', (e) => {
	            draggedItem = e.target
	            draggedCard = e.target.children[0]
	            fromColumn = column;

	            setTimeout(function() {
	            	draggedItem.style.display = 'none';  
	            }, 0);
	        })
	        
        	// Card dragged to table column
        	column.addEventListener('drop', (e) => {
 	            if (fromColumn !== e.currentTarget) {
	            	// Find last card container on the called column
		            let cardContainers = e.currentTarget.querySelectorAll('.cardContainer');
	        		let destinationContainer = cardContainers[cardContainers.length - 1];
	        		// If column is empty and dragged Card is King allow to drop
	        		if (!destinationContainer && draggedCard.dataset.value === 'K') {
	        			column.appendChild(draggedItem);
	        		} else if (!!destinationContainer) {
	        			// Check for colors and values
	        			let lastCard = destinationContainer.firstElementChild
	        			if(this.checkIfDifferentColors(lastCard.dataset.suit, draggedCard.dataset.suit) &&
	        				this.checkIfOneHigher(lastCard.dataset.value, draggedCard.dataset.value)) {
	        				destinationContainer.appendChild(draggedItem);
	        			}
	        		}	
	            }
        	})
        }
        
        for (let column of suitsColumns) {
        	// Card dragged from suits      
	        column.addEventListener('dragstart', (e) => {

	            draggedItem = e.currentTarget.lastElementChild
	            draggedCard = draggedItem.firstElementChild

	            setTimeout(function() {
	            	draggedItem.style.display = 'none'; 
	            }, 0);
	        })

        	// Card dragged to suits
        	column.addEventListener('drop', (e) => {
	            let columnCards = column.querySelectorAll('.card');
	            let lastCard = columnCards[columnCards.length - 1];

	            // Check if suit fits and user is dragging only one card
	            if (draggedCard.dataset.suit === column.dataset.suit &&
	            	draggedItem.querySelectorAll('.cardContainer').length === 0) {

	            	// Check if dragged card value is one bigger than previous one
	            	if ((!lastCard && draggedCard.dataset.value === 'A') ||
	            		(!!lastCard && this.checkIfOneHigher(draggedCard.dataset.value, lastCard.dataset.value))) {
	            		e.currentTarget.append(draggedItem);
            		}
				}
        	})
        }
        // Card dragged from stack       
        visibleStack.addEventListener('dragstart', (e) => {
            draggedItem = e.currentTarget.lastChild
            draggedCard = draggedItem.children[0]

            setTimeout(function() {
            	draggedItem.style.display = 'none'; 
            }, 0);
        })
		
        // Allows to drag
        gameTable.addEventListener('dragover', (e) => {
            e.preventDefault();
        })

        // Clear info when drag ends
        gameTable.addEventListener('dragend', (e) => {
        	if (!!fromColumn) {
        		this.revealCard(fromColumn)
        	}
            draggedItem.style.display = 'block';
            draggedItem = null;
            draggedCard = null;
            fromColumn = null;
        })

        /*this.gameTable.addEventListener('dragenter', (e) => {
            e.preventDefault();
        })

        this.gameTable.addEventListener('dragleave', (e) => {
        })*/

        // Reveal next card on stack when clicked
        hiddenStack.addEventListener('click', (e) => {
        	
        	let lastOnStack = e.currentTarget.firstElementChild;
        	if (!!lastOnStack) {
	        	let lastCard = lastOnStack.firstElementChild;

	        	lastOnStack.setAttribute('draggable', true);
	        	lastCard.className = 'card';
		    	lastCard.textContent = lastCard.dataset.value;

	        	visibleStack.appendChild(lastOnStack)
        	} else if (!!visibleStack.firstElementChild) {
        		let movedCards = visibleStack.querySelectorAll('.cardContainer')
        		for (let item of movedCards) {
        			item.setAttribute('draggable', false);
        			item.firstElementChild.className = 'card hidden';
        			item.firstElementChild.textContent = '';
        			hiddenStack.appendChild(item)
        		}
        		visibleStack.innerHTML = '';
        	}
        })
	}

	renderGame() {
        let template, cardTemplate, cardContainer, card, columnTemplate, column,
        suitColumnTemplate, suitColumn, stackColumn, table, suitsContainer;

        template = document.querySelector("template");
        cardTemplate = template.content.querySelector(".cardContainer");
        columnTemplate = template.content.querySelector(".tableColumn");
        suitColumnTemplate = template.content.querySelector(".suitColumn");
        stackColumn = document.querySelector(".stack[data-value='hidden']");
        table = document.querySelector(".tableContainer");
        suitsContainer = document.querySelector(".suitsContainer");

        // Render table
        for (let i = 0; i < 7; i++) {
            column = document.importNode(columnTemplate, false);
            column.dataset.columnIndex = i;
            table.appendChild(column);

            for (let item of this.model.gameSet.table[i]) {
                cardContainer = document.importNode(cardTemplate, true);
                card = cardContainer.children[0]
                card.className = "card hidden";
                card.dataset.value = item.value;
                card.dataset.suit = item.suit;
                column.appendChild(cardContainer);
            }
            this.revealCard(column)        
        }
        // Render suits
        for (let suit of this.model.suits) { 
            suitColumn = document.importNode(suitColumnTemplate, false);
            suitColumn.dataset.suit = suit;
            suitsContainer.appendChild(suitColumn);
        }
        // Render stack
        for (let item of this.model.gameSet.stack) {
	        cardContainer = document.importNode(cardTemplate, true);
	        card = cardContainer.firstElementChild;
	    	card.dataset.suit = item.suit;
	    	card.dataset.value = item.value;
	    	card.className = "card hidden";
	    	stackColumn.appendChild(cardContainer)  	
        }
    }

	checkIfOneHigher = (value1, value2) => {
    	let difference = this.model.values.indexOf(value1) - this.model.values.indexOf(value2)
    	if (difference === 1) {
    		return true
    	} else {
    		return false
    	}
    } 

    checkIfDifferentColors = (suit1, suit2) => {
    	let colors = {'Clubs': 'black', 
    				'Spades': 'black', 
    				'Hearts': 'red', 
    				'Diamonds': 'red'}
    	return !(colors[suit1] === colors[suit2])
    }

    revealCard = (column) => {
		if(!!column.lastElementChild) {
			let card = column.lastElementChild.firstElementChild;
			if (card.className = 'card hidden') {
	    		card.className = 'card';
	    		card.innerHTML = card.dataset.value;
	    		card.parentElement.setAttribute('draggable', true)
	    		return card
			}
		}
	}
}

let app = new Solitaire();
