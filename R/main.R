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



get_sdf <- function(df) {
    sdf <-
        df %>%
        select_if(is.numeric) %>% # Keep numeric variables
        gather(variable, value) %>%
        group_by(variable) %>%
        summarise(
            # n = sum(!is.na(value)),
            `Mean` = mean(value, na.rm = TRUE),
            `Median` = median(value, na.rm = TRUE),
            `Std` = sd(value, na.rm = TRUE)
        )
    return(sdf)
}

# ### Summary for Framing condition
for (value in c("txs_count")) { 
    print(paste("Framing: ", value))
    print(  get_sdf(filter(df, Framing == value) ))
}

# ### Summary for Health condition
# for (value in c("N", "M", "P")) { 
#     print(paste("Health: ", value))
#     print(  get_sdf(filter(df, Health == value) ))
# }

DF <- read.csv("~/github/aphd/aptos/data/blocks.csv", stringsAsFactors = T)
NOT_NAMES <- "rawVersion|assemblyStatement|doWhileStatement|block|public|version|revertStatement|simpleStatement|tryStatement|whileStatement|isFallback|throwStatement|isVirtual|pure|payable|libraries|interfaces"
NAMES <- colnames(DF)
NAMES <- NAMES[!grepl(NOT_NAMES, NAMES)]

plot_ccdf <- function(column_name) {
  library(ggplot2)

  # x <- sample.int(10, 100, replace = TRUE)

  tmp_df <- DF[!DF[[column_name]] == "n/a", ]
  x <- as.numeric(tmp_df[[column_name]])
  df <- data.frame(x)
  # x <- sample.int(10, 100, replace = TRUE)
  p <- ggplot(df, aes(x)) +
    stat_ecdf()
  pg <- ggplot_build(p)$data[[1]]
  log.model.df <- data.frame(
    x = log(pg$x),
    y = log(1 - pg$y)
  )
  exp.model.df <- data.frame(
    x = log(pg$x),
    y = exp(1 - pg$y)
  )
  my_ggplot <- ggplot(pg, aes(x = log(x), y = log(1 - y))) +
    geom_point() +
    geom_smooth(data = log.model.df, aes(x, y, color = "Log"), size = 1, linetype = 1, se = FALSE) +
    geom_smooth(method = "lm", aes(color = "Exp"), formula = (y ~ exp(x)), se = FALSE, linetype = 1) +
    labs(title = column_name) +
    # guides(color = guide_legend("Model Type")) +
    theme(legend.position = "bottom")

  return(my_ggplot)
}


myplots <- list() # new empty list

plot_multi_ggplot <- function(index) {
  # p1 <- plot_ccdf(col_names[index])
  # myplots[[index - 1]] <- p1
  p1 <- plot_ccdf("addresses")
  myplots[[1]] <- p1 # add each plot into plot list
  print("index....", index)
}


for (i in 1:12) {
  # p1 <- ggplot(data = data.frame(data2), aes(x = data2[, i])) +
  #   geom_bar(fill = "lightgreen") +
  #   xlab(colnames(data2)[i])
  # print(i)
  # print(p1)

  p1 <- plot_ccdf(NAMES[i])
  myplots[[i]] <- p1 # add each plot into plot list
}

# sapply(seq(col_names), plot_multi_ggplot)
print("multiplot___")
multiplot(plotlist = myplots, cols = 4)

# plot_ccdf("addresses")
