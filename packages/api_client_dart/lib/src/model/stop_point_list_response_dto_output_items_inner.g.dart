// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'stop_point_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const StopPointListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION =
    const StopPointListResponseDtoOutputItemsInnerTypeEnum._('BUS_STATION');
const StopPointListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointListResponseDtoOutputItemsInnerTypeEnum_OFFICE =
    const StopPointListResponseDtoOutputItemsInnerTypeEnum._('OFFICE');
const StopPointListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointListResponseDtoOutputItemsInnerTypeEnum_REST_STOP =
    const StopPointListResponseDtoOutputItemsInnerTypeEnum._('REST_STOP');
const StopPointListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT =
    const StopPointListResponseDtoOutputItemsInnerTypeEnum._('PICKUP_POINT');

StopPointListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointListResponseDtoOutputItemsInnerTypeEnumValueOf(String name) {
  switch (name) {
    case 'BUS_STATION':
      return _$stopPointListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION;
    case 'OFFICE':
      return _$stopPointListResponseDtoOutputItemsInnerTypeEnum_OFFICE;
    case 'REST_STOP':
      return _$stopPointListResponseDtoOutputItemsInnerTypeEnum_REST_STOP;
    case 'PICKUP_POINT':
      return _$stopPointListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<StopPointListResponseDtoOutputItemsInnerTypeEnum>
    _$stopPointListResponseDtoOutputItemsInnerTypeEnumValues = BuiltSet<
        StopPointListResponseDtoOutputItemsInnerTypeEnum>(const <StopPointListResponseDtoOutputItemsInnerTypeEnum>[
  _$stopPointListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION,
  _$stopPointListResponseDtoOutputItemsInnerTypeEnum_OFFICE,
  _$stopPointListResponseDtoOutputItemsInnerTypeEnum_REST_STOP,
  _$stopPointListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT,
]);

Serializer<StopPointListResponseDtoOutputItemsInnerTypeEnum>
    _$stopPointListResponseDtoOutputItemsInnerTypeEnumSerializer =
    _$StopPointListResponseDtoOutputItemsInnerTypeEnumSerializer();

class _$StopPointListResponseDtoOutputItemsInnerTypeEnumSerializer
    implements
        PrimitiveSerializer<StopPointListResponseDtoOutputItemsInnerTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    StopPointListResponseDtoOutputItemsInnerTypeEnum
  ];
  @override
  final String wireName = 'StopPointListResponseDtoOutputItemsInnerTypeEnum';

  @override
  Object serialize(Serializers serializers,
          StopPointListResponseDtoOutputItemsInnerTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  StopPointListResponseDtoOutputItemsInnerTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      StopPointListResponseDtoOutputItemsInnerTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$StopPointListResponseDtoOutputItemsInner
    extends StopPointListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String name;
  @override
  final StopPointListResponseDtoOutputItemsInnerTypeEnum type;
  @override
  final String address;
  @override
  final String provinceId;
  @override
  final String wardId;
  @override
  final num latitude;
  @override
  final num longitude;
  @override
  final String? description;

  factory _$StopPointListResponseDtoOutputItemsInner(
          [void Function(StopPointListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (StopPointListResponseDtoOutputItemsInnerBuilder()..update(updates))
          ._build();

  _$StopPointListResponseDtoOutputItemsInner._(
      {required this.id,
      required this.name,
      required this.type,
      required this.address,
      required this.provinceId,
      required this.wardId,
      required this.latitude,
      required this.longitude,
      this.description})
      : super._();
  @override
  StopPointListResponseDtoOutputItemsInner rebuild(
          void Function(StopPointListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StopPointListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      StopPointListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StopPointListResponseDtoOutputItemsInner &&
        id == other.id &&
        name == other.name &&
        type == other.type &&
        address == other.address &&
        provinceId == other.provinceId &&
        wardId == other.wardId &&
        latitude == other.latitude &&
        longitude == other.longitude &&
        description == other.description;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, provinceId.hashCode);
    _$hash = $jc(_$hash, wardId.hashCode);
    _$hash = $jc(_$hash, latitude.hashCode);
    _$hash = $jc(_$hash, longitude.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'StopPointListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('name', name)
          ..add('type', type)
          ..add('address', address)
          ..add('provinceId', provinceId)
          ..add('wardId', wardId)
          ..add('latitude', latitude)
          ..add('longitude', longitude)
          ..add('description', description))
        .toString();
  }
}

class StopPointListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<StopPointListResponseDtoOutputItemsInner,
            StopPointListResponseDtoOutputItemsInnerBuilder> {
  _$StopPointListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  StopPointListResponseDtoOutputItemsInnerTypeEnum? _type;
  StopPointListResponseDtoOutputItemsInnerTypeEnum? get type => _$this._type;
  set type(StopPointListResponseDtoOutputItemsInnerTypeEnum? type) =>
      _$this._type = type;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  String? _provinceId;
  String? get provinceId => _$this._provinceId;
  set provinceId(String? provinceId) => _$this._provinceId = provinceId;

  String? _wardId;
  String? get wardId => _$this._wardId;
  set wardId(String? wardId) => _$this._wardId = wardId;

  num? _latitude;
  num? get latitude => _$this._latitude;
  set latitude(num? latitude) => _$this._latitude = latitude;

  num? _longitude;
  num? get longitude => _$this._longitude;
  set longitude(num? longitude) => _$this._longitude = longitude;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  StopPointListResponseDtoOutputItemsInnerBuilder() {
    StopPointListResponseDtoOutputItemsInner._defaults(this);
  }

  StopPointListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _type = $v.type;
      _address = $v.address;
      _provinceId = $v.provinceId;
      _wardId = $v.wardId;
      _latitude = $v.latitude;
      _longitude = $v.longitude;
      _description = $v.description;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StopPointListResponseDtoOutputItemsInner other) {
    _$v = other as _$StopPointListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(StopPointListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StopPointListResponseDtoOutputItemsInner build() => _build();

  _$StopPointListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$StopPointListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'StopPointListResponseDtoOutputItemsInner', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'StopPointListResponseDtoOutputItemsInner', 'name'),
          type: BuiltValueNullFieldError.checkNotNull(
              type, r'StopPointListResponseDtoOutputItemsInner', 'type'),
          address: BuiltValueNullFieldError.checkNotNull(
              address, r'StopPointListResponseDtoOutputItemsInner', 'address'),
          provinceId: BuiltValueNullFieldError.checkNotNull(provinceId,
              r'StopPointListResponseDtoOutputItemsInner', 'provinceId'),
          wardId: BuiltValueNullFieldError.checkNotNull(
              wardId, r'StopPointListResponseDtoOutputItemsInner', 'wardId'),
          latitude: BuiltValueNullFieldError.checkNotNull(latitude,
              r'StopPointListResponseDtoOutputItemsInner', 'latitude'),
          longitude: BuiltValueNullFieldError.checkNotNull(longitude,
              r'StopPointListResponseDtoOutputItemsInner', 'longitude'),
          description: description,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
