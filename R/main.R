# Requirements
library(dplyr)
library(gapminder)
library(dplyr)
library(tidyr)
library(xtable)
library(ggplot2)

FNAME <- "~/github/aphd/aptos/data/blocks.csv"
df <- read.csv(FNAME, stringsAsFactors = T)

colnames(df)

df_stats = data.frame(df$gas_unit_price, df$txs_count, df$gas_used, df$max_gas_amount)
summary(df_stats)
print(xtable(t(summary(df_stats))), type="latex", include.rownames=TRUE)

# TODO boxplot/violin plot
boxplot(df$txs_count)
boxplot(df$gas_used)

#  TODO number of transactions per second
FNAME <- "~/github/aphd/aptos/data/tps.csv"
df <- read.csv(FNAME, stringsAsFactors = T)
boxplot(df$X0, main="Transactions Per Second (TPS)")
