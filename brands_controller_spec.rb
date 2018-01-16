require 'rails_helper'
require 'spec_helper'

RSpec.describe Admin::BrandsController, :type => :controller do

  let(:brand_attributes) { FactoryGirl.build(:brand).attributes.symbolize_keys }
  let(:prospect_attributes) { FactoryGirl.build(:prospect).attributes.symbolize_keys }
  let(:user) { FactoryGirl.build(:user) }
  before { allow(controller).to receive(:current_user) { user } }

  describe "GET #index" do
    it "returns brands"  do
      brand = Brand.create brand_attributes
      get :index
      expect(assigns(:brands)).should_not be nil
    end
  end

  describe "GET #edit" do
    it "gets all prospects" do
      prospect = Prospect.create prospect_attributes
      params = {:id => 17}
      get :edit, params
      expect(assigns(:prospects)).should_not be nil
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new brand" do
        expect { post :create, {:brand => brand_attributes}
        }.to change(brand, :count).by(1)
      end

      it "assigns a newly created brand as @brand" do
        post :create, {:brand => brand_attributes}
        expect(assigns(:brand)).to be_a(brand)
        expect(assigns(:brand)).to be_persisted
      end

      it "redirects to the created brand" do
        post :create, {:brand => brand_attributes}
        expect(response).to redirect_to(admin_brands_url)
      end
    end
  end

  describe "PUT #update" do
    context "with valid params" do
      it "updates the requested brand" do
        brand = Brand.create! brand_attributes
        @request.env['HTTP_REFERER'] = admin_brands_url
        put :update, {:id => brand.to_param, :brand => brand_attributes}
        brand.reload
      end
      it "assigns the requested brand as @brand" do
        brand = Brand.create! brand_attributes
        @request.env['HTTP_REFERER'] = admin_brands_url
        put :update, {:id => brand.to_param, :brand => brand_attributes}
        expect(assigns(:brand)).to eq(brand)
      end
    end
  end

  describe "DELETE #destroy" do
    it "destroys the requested brand" do
      brand = Brand.create! brand_attributes
      expect {
        delete :destroy, {:id => brand.to_param}
      }.to change(brand, :count).by(-1)
    end
    it "redirects to the brands list" do
      brand = Brand.create! brand_attributes
      delete :destroy, {:id => brand.to_param}
      expect(response).to redirect_to(admin_brands_url)
    end
  end

end
