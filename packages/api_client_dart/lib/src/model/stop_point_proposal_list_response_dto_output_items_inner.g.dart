// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'stop_point_proposal_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION =
    const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum._(
        'BUS_STATION');
const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_OFFICE =
    const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum._('OFFICE');
const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_REST_STOP =
    const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum._(
        'REST_STOP');
const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT =
    const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum._(
        'PICKUP_POINT');

StopPointProposalListResponseDtoOutputItemsInnerTypeEnum
    _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnumValueOf(
        String name) {
  switch (name) {
    case 'BUS_STATION':
      return _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION;
    case 'OFFICE':
      return _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_OFFICE;
    case 'REST_STOP':
      return _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_REST_STOP;
    case 'PICKUP_POINT':
      return _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<StopPointProposalListResponseDtoOutputItemsInnerTypeEnum>
    _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnumValues = BuiltSet<
        StopPointProposalListResponseDtoOutputItemsInnerTypeEnum>(const <StopPointProposalListResponseDtoOutputItemsInnerTypeEnum>[
  _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION,
  _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_OFFICE,
  _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_REST_STOP,
  _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT,
]);

const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum
    _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_PENDING =
    const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum._(
        'PENDING');
const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum
    _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_APPROVED =
    const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum._(
        'APPROVED');
const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum
    _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_REJECTED =
    const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum._(
        'REJECTED');

StopPointProposalListResponseDtoOutputItemsInnerStatusEnum
    _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnumValueOf(
        String name) {
  switch (name) {
    case 'PENDING':
      return _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_PENDING;
    case 'APPROVED':
      return _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_APPROVED;
    case 'REJECTED':
      return _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_REJECTED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<StopPointProposalListResponseDtoOutputItemsInnerStatusEnum>
    _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnumValues =
    BuiltSet<
        StopPointProposalListResponseDtoOutputItemsInnerStatusEnum>(const <StopPointProposalListResponseDtoOutputItemsInnerStatusEnum>[
  _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_PENDING,
  _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_APPROVED,
  _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_REJECTED,
]);

Serializer<StopPointProposalListResponseDtoOutputItemsInnerTypeEnum>
    _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnumSerializer =
    _$StopPointProposalListResponseDtoOutputItemsInnerTypeEnumSerializer();
Serializer<StopPointProposalListResponseDtoOutputItemsInnerStatusEnum>
    _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnumSerializer =
    _$StopPointProposalListResponseDtoOutputItemsInnerStatusEnumSerializer();

class _$StopPointProposalListResponseDtoOutputItemsInnerTypeEnumSerializer
    implements
        PrimitiveSerializer<
            StopPointProposalListResponseDtoOutputItemsInnerTypeEnum> {
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
    StopPointProposalListResponseDtoOutputItemsInnerTypeEnum
  ];
  @override
  final String wireName =
      'StopPointProposalListResponseDtoOutputItemsInnerTypeEnum';

  @override
  Object serialize(Serializers serializers,
          StopPointProposalListResponseDtoOutputItemsInnerTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  StopPointProposalListResponseDtoOutputItemsInnerTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      StopPointProposalListResponseDtoOutputItemsInnerTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$StopPointProposalListResponseDtoOutputItemsInnerStatusEnumSerializer
    implements
        PrimitiveSerializer<
            StopPointProposalListResponseDtoOutputItemsInnerStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    StopPointProposalListResponseDtoOutputItemsInnerStatusEnum
  ];
  @override
  final String wireName =
      'StopPointProposalListResponseDtoOutputItemsInnerStatusEnum';

  @override
  Object serialize(Serializers serializers,
          StopPointProposalListResponseDtoOutputItemsInnerStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  StopPointProposalListResponseDtoOutputItemsInnerStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      StopPointProposalListResponseDtoOutputItemsInnerStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$StopPointProposalListResponseDtoOutputItemsInner
    extends StopPointProposalListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String name;
  @override
  final StopPointProposalListResponseDtoOutputItemsInnerTypeEnum type;
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
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final StopPointProposalListResponseDtoOutputItemsInnerStatusEnum status;
  @override
  final String? rejectionReason;
  @override
  final String? catalogStopPointId;

  factory _$StopPointProposalListResponseDtoOutputItemsInner(
          [void Function(
                  StopPointProposalListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (StopPointProposalListResponseDtoOutputItemsInnerBuilder()
            ..update(updates))
          ._build();

  _$StopPointProposalListResponseDtoOutputItemsInner._(
      {required this.id,
      required this.name,
      required this.type,
      required this.address,
      required this.provinceId,
      required this.wardId,
      required this.latitude,
      required this.longitude,
      this.description,
      required this.createdAt,
      required this.updatedAt,
      required this.status,
      this.rejectionReason,
      this.catalogStopPointId})
      : super._();
  @override
  StopPointProposalListResponseDtoOutputItemsInner rebuild(
          void Function(StopPointProposalListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StopPointProposalListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      StopPointProposalListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StopPointProposalListResponseDtoOutputItemsInner &&
        id == other.id &&
        name == other.name &&
        type == other.type &&
        address == other.address &&
        provinceId == other.provinceId &&
        wardId == other.wardId &&
        latitude == other.latitude &&
        longitude == other.longitude &&
        description == other.description &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        status == other.status &&
        rejectionReason == other.rejectionReason &&
        catalogStopPointId == other.catalogStopPointId;
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
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, rejectionReason.hashCode);
    _$hash = $jc(_$hash, catalogStopPointId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'StopPointProposalListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('name', name)
          ..add('type', type)
          ..add('address', address)
          ..add('provinceId', provinceId)
          ..add('wardId', wardId)
          ..add('latitude', latitude)
          ..add('longitude', longitude)
          ..add('description', description)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('status', status)
          ..add('rejectionReason', rejectionReason)
          ..add('catalogStopPointId', catalogStopPointId))
        .toString();
  }
}

class StopPointProposalListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<StopPointProposalListResponseDtoOutputItemsInner,
            StopPointProposalListResponseDtoOutputItemsInnerBuilder> {
  _$StopPointProposalListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  StopPointProposalListResponseDtoOutputItemsInnerTypeEnum? _type;
  StopPointProposalListResponseDtoOutputItemsInnerTypeEnum? get type =>
      _$this._type;
  set type(StopPointProposalListResponseDtoOutputItemsInnerTypeEnum? type) =>
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

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  StopPointProposalListResponseDtoOutputItemsInnerStatusEnum? _status;
  StopPointProposalListResponseDtoOutputItemsInnerStatusEnum? get status =>
      _$this._status;
  set status(
          StopPointProposalListResponseDtoOutputItemsInnerStatusEnum? status) =>
      _$this._status = status;

  String? _rejectionReason;
  String? get rejectionReason => _$this._rejectionReason;
  set rejectionReason(String? rejectionReason) =>
      _$this._rejectionReason = rejectionReason;

  String? _catalogStopPointId;
  String? get catalogStopPointId => _$this._catalogStopPointId;
  set catalogStopPointId(String? catalogStopPointId) =>
      _$this._catalogStopPointId = catalogStopPointId;

  StopPointProposalListResponseDtoOutputItemsInnerBuilder() {
    StopPointProposalListResponseDtoOutputItemsInner._defaults(this);
  }

  StopPointProposalListResponseDtoOutputItemsInnerBuilder get _$this {
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
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _status = $v.status;
      _rejectionReason = $v.rejectionReason;
      _catalogStopPointId = $v.catalogStopPointId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StopPointProposalListResponseDtoOutputItemsInner other) {
    _$v = other as _$StopPointProposalListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(StopPointProposalListResponseDtoOutputItemsInnerBuilder)?
          updates) {
    if (updates != null) updates(this);
  }

  @override
  StopPointProposalListResponseDtoOutputItemsInner build() => _build();

  _$StopPointProposalListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$StopPointProposalListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'StopPointProposalListResponseDtoOutputItemsInner', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(name,
              r'StopPointProposalListResponseDtoOutputItemsInner', 'name'),
          type: BuiltValueNullFieldError.checkNotNull(type,
              r'StopPointProposalListResponseDtoOutputItemsInner', 'type'),
          address: BuiltValueNullFieldError.checkNotNull(address,
              r'StopPointProposalListResponseDtoOutputItemsInner', 'address'),
          provinceId: BuiltValueNullFieldError.checkNotNull(
              provinceId,
              r'StopPointProposalListResponseDtoOutputItemsInner',
              'provinceId'),
          wardId: BuiltValueNullFieldError.checkNotNull(wardId,
              r'StopPointProposalListResponseDtoOutputItemsInner', 'wardId'),
          latitude: BuiltValueNullFieldError.checkNotNull(latitude,
              r'StopPointProposalListResponseDtoOutputItemsInner', 'latitude'),
          longitude: BuiltValueNullFieldError.checkNotNull(longitude,
              r'StopPointProposalListResponseDtoOutputItemsInner', 'longitude'),
          description: description,
          createdAt: BuiltValueNullFieldError.checkNotNull(createdAt,
              r'StopPointProposalListResponseDtoOutputItemsInner', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(updatedAt,
              r'StopPointProposalListResponseDtoOutputItemsInner', 'updatedAt'),
          status: BuiltValueNullFieldError.checkNotNull(status,
              r'StopPointProposalListResponseDtoOutputItemsInner', 'status'),
          rejectionReason: rejectionReason,
          catalogStopPointId: catalogStopPointId,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
