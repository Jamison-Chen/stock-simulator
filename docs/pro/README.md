# Demand/Supply Simulator

This project trys to simulate the transactions happeneing in the market. You can see how the market organize itself, that is, run into equilibrium, and the difference of consumer surplus and producer surplus under different situations.

## Concept Descriptions

* We have a random-walking "fair value" that changes over time. And we wanna see how long does it take for the market to fully respond to this fair value. In other words, we are interested in how fast will the "market equilibrium price" chase up the fair value. This is to verify if the EMH (Efficient Market Theorem) is true.

* You can arbitrarily choose two numbers as the amount of consumers and suppliers, and furthermore check if the consumer surplus and producer surplus differ over each combination of amounts. You will hopefully acquire such conclusion that says if consumers is more than suppliers, the producer surplus will be higher than the consumer surplus; and if suppliers is more than consumers, the consumer surplus will be higher than the producer surplus. We can explain this phenomenon as that: the more "competitive" it is between consumers, the less surplus will each of them end up acquiring, and same story for suppliers.

## Mechanism Descriptions

* There will be a "price generator" (PriceMachine) continuously deciding the fair value. This price generator can also generate max-payable price and min-sellable price for consumers and suppliers. Of course, the max-payable price and the min-sellable price are generated base on the fair value. You can imagine a normal distribution with a mean equaling the fair value. This is how they are decided.

* The reason that the price generator generate max-payable price and min-sellable price "around" the fair value is that we assume that all the consumers studied hard to acquire the fundamental info of the goods, so they almost know the fair value but still has some "guessing error". Similarly, we assume that all the suppliers tried their best to improve the efficiency of producing, so they can almost produce goods withthe costs equaling the fair value but still has some deviation in efficiency.

* Upon receiving the max-payable price, the consumer will then choose an "initial bided price" that falls at somewhere below the max-payable price. This initial bided price is also determined using a normal distribution with a mean equaling the max-payable price, coonsidering only the right tail of the distribution, though.

* On the other hand, upon receiving the min-sellable price, the supplier will then choose an "initial asked price" that falls at somewhere above the min-sellable price. This initial asked price is, again, determined using a normal distribution with a mean equaling the min-sellable price, coonsidering only the left tail of the distribution.

* After deciding the bis/ask price, all the consumers and suppliers then go to the market. We randomly match each consumer to each supplier. However, it's not truely random because we will try to let each supplier confront the same amount of consumers. That is, we assume that the consumer won't choose a supplier that already has lots of consumers in front of it if there is some other suppliers with less consumers. So, for example, if there is 10 consumers and 2 suppliers in the market, it will end up with each supplier having 5 consumers in front of it.

* After matching, each supplier will then choose the consumer ( lining in front of them) with the highest bid price, and see if this "highest bided price" is higher than the supplier's ask price. If it is, they're dealt and all the other consumers in the line failed to deal. Otherwise, if even the highest bided price is less than the ask price, the supplier and all the consumers in the line failed to deal.

* If a consumer failed to deal after a round, it will rebid a new price that falls between the former bid price and the max-payable price; if a supplier failed to deal after a round, it will reask a new price that falls between the former ask price and the min-sellable price.

* If a supplier or a consumer keep failing to deal for an amount of successive rounds (e.g. a successive 20-day) it will than die. Yet, we assume that this market is so competitve and attractive that once a supplier dies, a new supplier will then come in to replace it, and same story on the consumer side.

* If a consumer or a supplier keep making deal, it wil become more and more aggressive. The agggressiveness are reflected when that consumer/supplier initially bid/ask a price.

* If a consumer or a supplier dealt in a round it will acquire a new max-payable/min-sellable price in the next round.
