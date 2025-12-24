import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report,accuracy_score
column_names = ['id','sepal_length','sepal_width','petal_length','petal_width','class']
iris_data = pd.read_csv('Iris.csv', names=column_names, header=0)
print(iris_data)
iris_dataNew=iris_data.drop(columns=['id']).drop(iris_data.index[0])
print(iris_dataNew.head(5))
desribedData=iris_dataNew.describe()
print(desribedData)
sns.pairplot(iris_dataNew, hue='class')
plt.show()
X = iris_dataNew.drop(columns=['class'])
print(X)
y= iris_dataNew['class']
print(y)
X_train,X_test, y_train,y_test= train_test_split(X,y,test_size=0.3,random_state=42)
knn= KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train,y_train)
y_pred = knn.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
new_data = pd.DataFrame({"sepal_length":[5.1],"sepal_width":3.5, "petal_length":1.4,"petal_width":0.2})
prediction=knn.predict(new_data)
print(prediction)