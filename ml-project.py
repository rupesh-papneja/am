# -*- coding: utf-8 -*-
"""
Created on Tue Apr  9 18:40:31 2019

@author: papnejar
"""

# import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns  # visualization tool
import os as os

os.chdir('c:\\ml\\project')

data = pd.read_csv('data.csv', sep = '\t')

data.head(5)

data.shape


data['major'].isnull().sum()

for d in data.columns:
    print(d, data[d].isnull().sum())

del d

majors = data['major'].unique()

data.drop("major", axis=1, inplace=True)

data.head(5)

for d in data.columns:
    print(d, data[d].isnull().sum())
del d

# data.loc[data['country'].isnull()]

data = data.dropna()

for d in data.columns:
    print(d, data[d].isnull().sum() == 0)
del d

categories = data.columns[~data.columns.isin(['age','introelapse', 'testelapse', 'surveyelapse', 'screenh', 'screenw', 'familysize', 'country'])]

for d in categories:
    print(d, data[d].unique())
del d

data = data[~(data.loc[:,'Q1':'Q26':1]==0).all(axis=1)]

data_26 = data.loc[:,'Q1':'Q26':1]

data_26 = data_26[(data_26==0).all(axis=1)]

del data_26

(data['age'] > 120).sum()

data = data[data['age']<120]

min(data['familysize'])
max(data['familysize'])

data_family = data.loc[(data['familysize'] > 25)]

data = data.loc[data['familysize']<25]

plt.boxplot(data['familysize'], showbox=True, autorange=True)

del data_family

(data['country'] == 'NONE').sum()
