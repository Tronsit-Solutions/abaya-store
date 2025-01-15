class AdminUser < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Ensure the model name is properly configured for Devise
  def self.model_name
    ActiveModel::Name.new(self, nil, "AdminUser")
  end
end
